const axios = require('axios');
const path = require('path');
const { getRAGContext } = require('../../rag/ragService');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Wallet = require('../models/Wallet');
const PDFDocument = require('pdfkit');

// Ollama endpoints - internet only
const OLLAMA_ENDPOINTS = [
  'http://tkjskanesa.my.id:8085'
];

const OLLAMA_MODEL = 'qwen3.5:9b';

// In-memory cache for working endpoints per user session
// Format: { userId: 'http://endpoint' }
const userEndpointCache = new Map();

// RAG configuration
const RAG_CONFIG = {
  enabled: true,           // Enable/disable RAG
  topK: 5,                // Number of relevant chunks to retrieve
  threshold: 0.3,         // Minimum similarity threshold (lowered for better retrieval)
  useForQuestions: true   // Use RAG for questions about MyMo system
};

// Helper function to get current month date range
function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

// Helper function to fetch and format user's financial data
async function getUserFinancialContext(userId) {
  try {
    const { startDate, endDate } = getCurrentMonthRange();

    // Fetch summary for current month
    const summary = await Transaction.getSummary(userId, startDate, endDate);

    // Fetch wallets and calculate total balance
    const wallets = await Wallet.findByUserId(userId);
    const totalWalletBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || 0), 0);

    // Fetch recent transactions (last 30)
    const transactions = await Transaction.findByUserId(userId, {
      limit: 30,
      offset: 0
    });

    // Fetch categories with counts
    const categories = await Category.findByUserIdWithCounts(userId);

    // Format the data
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentMonth = monthNames[new Date().getMonth()];
    const currentYear = new Date().getFullYear();

    let context = `\n=== DATA KEUANGAN USER (${currentMonth} ${currentYear}) ===\n\n`;

    // Add summary
    context += `RINGKASAN BULAN INI:\n`;
    context += `- Saldo saat ini: Rp ${totalWalletBalance.toLocaleString('id-ID')}\n`;
    context += `- Total Pemasukan: Rp ${summary.income?.toLocaleString('id-ID') || '0'}\n`;
    context += `- Total Pengeluaran: Rp ${summary.expense?.toLocaleString('id-ID') || '0'}\n\n`;

    // Add recent transactions
    if (transactions && transactions.length > 0) {
      context += `TRANSAKSI TERBARU (${transactions.length} terakhir):\n`;
      transactions.forEach((t, idx) => {
        const date = new Date(t.date).toLocaleDateString('id-ID');
        const type = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
        const amount = `Rp ${parseFloat(t.amount).toLocaleString('id-ID')}`;
        const category = t.category_name || 'Tanpa kategori';
        const desc = t.description || '-';
        context += `${idx + 1}. ${date} | ${type} | ${amount} | ${category} | ${desc}\n`;
      });
      context += `\n`;
    }

    // Add categories with spending info
    if (categories && categories.length > 0) {
      const expenseCategories = categories.filter(c => c.type === 'expense');
      if (expenseCategories.length > 0) {
        context += `KATEGORI & BUDGET:\n`;
        expenseCategories.forEach(cat => {
          const spent = parseFloat(cat.total_spent || 0);
          const budget = parseFloat(cat.budget || 0);
          const name = cat.name || 'Unknown';

          if (budget > 0) {
            const percentage = ((spent / budget) * 100).toFixed(0);
            context += `- ${name}: Rp ${spent.toLocaleString('id-ID')} / Rp ${budget.toLocaleString('id-ID')} budget (${percentage}% terpakai)\n`;
          } else {
            context += `- ${name}: Rp ${spent.toLocaleString('id-ID')} (tanpa budget)\n`;
          }
        });
      }
    }

    context += `\n=== AKHIR DATA KEUANGAN ===\n`;

    return context;
  } catch (error) {
    console.error('Error fetching user financial context:', error);
    return '\n(Data keuangan user tidak tersedia)\n';
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.userId;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Set SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Format conversation history for Ollama
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Try to get RAG context and user financial data
    let ragContext = null;
    let ragSources = [];
    let userFinancialContext = null;

    res.write(`data: ${JSON.stringify({ type: 'loading', message: 'Mengambil konteks...' })}\n\n`);

    // Fetch user's financial data
    try {
      console.log('Fetching user financial context...');
      userFinancialContext = await getUserFinancialContext(userId);
      console.log('User financial context retrieved');
    } catch (error) {
      console.error('Failed to fetch user financial context:', error.message);
    }

    // Fetch RAG documentation context
    if (RAG_CONFIG.enabled) {
      try {
        console.log('Attempting RAG retrieval for query...');
        const ragResult = await getRAGContext(message, {
          topK: RAG_CONFIG.topK,
          threshold: RAG_CONFIG.threshold,
          includeMetadata: true
        });

        if (ragResult && ragResult.context) {
          ragContext = ragResult.context;
          ragSources = ragResult.sources || [];
          console.log(`RAG context added from sources: ${ragSources.join(', ')}`);
        } else {
          console.log('No relevant RAG context found for this query');
        }
      } catch (error) {
        console.error('RAG retrieval failed:', error.message);
      }
    }

    // Build system prompt with both RAG and user financial context
    if (ragContext || userFinancialContext) {
      let systemPrompt = 'You are MyMo AI Assistant. You can help users with:\n';
      systemPrompt += '1. Cara menggunakan fitur-fitur MyMo (dari dokumentasi)\n';
      systemPrompt += '2. Pertanyaan tentang data keuangan mereka sendiri\n\n';

      if (ragContext) {
        systemPrompt += '=== DOKUMENTASI TENTANG MYMO ===\n\n';
        systemPrompt += ragContext + '\n\n';
      }

      if (userFinancialContext) {
        systemPrompt += userFinancialContext + '\n\n';
      }

      systemPrompt += 'Jawab pertanyaan tentang KEDUA hal: cara menggunakan MyMo DAN data keuangan spesifik user. ';
      systemPrompt += 'Ketika user bertanya tentang data mereka (transaksi, pengeluaran, balance, kategori), gunakan informasi di bagian "DATA KEUANGAN USER" di atas. ';
      systemPrompt += 'Berikan jawaban dalam bahasa Indonesia yang jelas dan mudah dipahami.';

      messages.unshift({
        role: 'system',
        content: systemPrompt
      });

      console.log('System prompt built with RAG and user financial context');
    }

    res.write(`data: ${JSON.stringify({ type: 'loading', message: 'Berpikir...' })}\n\n`);

    // Helper function to try an endpoint with streaming
    const tryEndpoint = async (endpoint) => {
      console.log(`Attempting to connect to Ollama at ${endpoint}...`);

      const response = await axios.post(
        `${endpoint}/api/chat`,
        {
          model: OLLAMA_MODEL,
          messages: messages,
          stream: true
        },
        {
          timeout: 120000,
          headers: {
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );

      console.log(`Successfully connected to Ollama at ${endpoint}`);
      return response;
    };

    const cachedEndpoint = userEndpointCache.get(userId);
    let workingEndpoint = null;
    let ollamaStream = null;

    if (cachedEndpoint) {
      console.log(`Using cached endpoint for user ${userId}: ${cachedEndpoint}`);
      try {
        ollamaStream = await tryEndpoint(cachedEndpoint);
        workingEndpoint = cachedEndpoint;
      } catch (error) {
        console.error(`Cached endpoint ${cachedEndpoint} failed:`, error.message);
        console.log(`Clearing cached endpoint and trying all endpoints...`);
        userEndpointCache.delete(userId);
      }
    }

    if (!ollamaStream) {
      let lastError = null;
      for (const endpoint of OLLAMA_ENDPOINTS) {
        try {
          ollamaStream = await tryEndpoint(endpoint);
          workingEndpoint = endpoint;
          userEndpointCache.set(userId, endpoint);
          console.log(`Cached working endpoint ${endpoint} for user ${userId}`);
          break;
        } catch (error) {
          console.error(`Failed to connect to ${endpoint}:`, error.message);
          lastError = error;
        }
      }

      if (!ollamaStream) {
        console.error('All Ollama endpoints failed:', lastError?.message);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Ollama server tidak dapat dijangkau' })}\n\n`);
        res.end();
        return;
      }
    }

    let fullResponse = '';

    ollamaStream.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);

          if (parsed.message && parsed.message.content) {
            const content = parsed.message.content;
            fullResponse += content;

            res.write(`data: ${JSON.stringify({
              type: 'chunk',
              content: content
            })}\n\n`);
          }

          if (parsed.done) {
            res.write(`data: ${JSON.stringify({
              type: 'done',
              model: OLLAMA_MODEL,
              endpoint: workingEndpoint,
              rag: {
                enabled: RAG_CONFIG.enabled,
                used: !!ragContext,
                sources: ragSources
              }
            })}\n\n`);
            res.end();
          }
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }
    });

    ollamaStream.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Terjadi kesalahan saat streaming' })}\n\n`);
      res.end();
    });

    ollamaStream.data.on('end', () => {
      if (!res.writableEnded) {
        res.end();
      }
    });

  } catch (error) {
    console.error('Chat controller error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Terjadi kesalahan pada server',
        details: error.message
      });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }
};

// Health check for Ollama connection
exports.checkConnection = async (req, res) => {
  const statuses = [];

  for (const endpoint of OLLAMA_ENDPOINTS) {
    try {
      await axios.get(`${endpoint}/api/tags`, { timeout: 5000 });
      statuses.push({ endpoint, status: 'connected' });
    } catch (error) {
      statuses.push({ endpoint, status: 'disconnected', error: error.message });
    }
  }

  res.json({ statuses });
};

// Clear cached endpoint for a user (called on logout)
exports.clearUserCache = (userId) => {
  const deleted = userEndpointCache.delete(userId);
  if (deleted) {
    console.log(`Cleared cached endpoint for user ${userId}`);
  }
  return deleted;
};

// Analyze receipt image with OCR + AI
exports.analyzeReceipt = async (req, res) => {
  try {
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Step 1: Extract text using OCR service
    const ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://mymo-ocr:8000';
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Calling OCR service...');
    const ocrResponse = await axios.post(`${ocrServiceUrl}/ocr`, formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });

    const ocrText = ocrResponse.data.text;
    console.log('OCR extracted text:', ocrText);

    // Step 2: Fetch user's categories and wallets for context
    const categories = await Category.findByUserId(userId);
    const wallets = await Wallet.findByUserId(userId);

    const categoryNames = categories
      .filter(c => c.type === 'expense')
      .map(c => c.name)
      .join(', ');

    // Step 3: Ask Ollama to extract transaction data
    const extractionPrompt = `Kamu adalah MyMo AI Assistant. Analisis teks struk berikut dan ekstrak data transaksi.

TEXT STRUK:
${ocrText}

KATEGORI YANG TERSEDIA:
${categoryNames}

Ekstrak informasi berikut dalam format JSON:
{
  "amount": <nominal total dalam angka murni tanpa format, contoh: 3500000 untuk tiga juta lima ratus ribu>,
  "date": <tanggal dalam format YYYY-MM-DD, jika tidak ada gunakan hari ini>,
  "description": <deskripsi singkat transaksi, maksimal 50 karakter>,
  "suggestedCategory": <pilih kategori paling sesuai dari daftar di atas>,
  "confidence": <"high", "medium", atau "low" berdasarkan kejelasan informasi>
}

ATURAN PENTING:
- FORMAT ANGKA INDONESIA: "3.500.000" = 3500000 (tiga juta lima ratus ribu). Titik (.) adalah pemisah ribuan, BUKAN desimal
- Untuk amount, PAHAMI angka Indonesia terlebih dahulu, lalu konversi ke angka murni
- Contoh: "Rp 3.500.000,00" → amount: 3500000
- Contoh: "Rp 150.000" → amount: 150000
- Contoh: "Rp 1.250.750" → amount: 1250750
- Cari total/grand total/jumlah bayar untuk amount
- Jika tanggal tidak jelas, gunakan tanggal hari ini: ${new Date().toISOString().split('T')[0]}
- Description singkat dan jelas (contoh: "Transfer ke [nama]", "Belanja Alfamart")
- Pilih kategori yang paling cocok, atau "Lainnya" jika tidak ada yang pas
- Confidence "high" jika semua data jelas, "medium" jika ada yang kurang jelas, "low" jika banyak yang tidak jelas

Jawab HANYA dengan JSON, tanpa penjelasan tambahan.`;

    console.log('Sending extraction prompt to Ollama...');

    // Try endpoints
    let ollamaResponse = null;
    for (const endpoint of OLLAMA_ENDPOINTS) {
      try {
        ollamaResponse = await axios.post(
          `${endpoint}/api/generate`,
          {
            model: OLLAMA_MODEL,
            prompt: extractionPrompt,
            stream: false
          },
          { timeout: 120000 }
        );

        if (ollamaResponse.data && ollamaResponse.data.response) {
          break;
        }
      } catch (error) {
        console.error(`Failed to connect to ${endpoint}:`, error.message);
      }
    }

    if (!ollamaResponse) {
      return res.status(503).json({ error: 'Ollama service unavailable' });
    }

    // Parse JSON response
    const aiResponse = ollamaResponse.data.response.trim();
    console.log('AI response:', aiResponse);

    // Extract JSON from response (handle markdown code blocks)
    console.log('Attempting to extract JSON...');
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON match found');
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    console.log('JSON extracted, attempting to parse...');
    const extractedData = JSON.parse(jsonMatch[0]);
    console.log('Parsed data:', extractedData);

    // Find category ID
    console.log('Looking for category:', extractedData.suggestedCategory);
    const category = categories.find(c =>
      c.name.toLowerCase() === extractedData.suggestedCategory.toLowerCase()
    );
    console.log('Category found:', category ? category.id : 'null');

    // Build transaction object
    console.log('Building transaction object...');
    const transaction = {
      amount: parseFloat(extractedData.amount),
      date: extractedData.date,
      description: extractedData.description,
      categoryId: category ? category.id : null,
      categoryName: extractedData.suggestedCategory,
      walletId: wallets.length > 0 ? wallets[0].id : null,
      type: 'expense',
      confidence: extractedData.confidence
    };

    console.log('Sending response...');
    res.json({
      transaction,
      ocrText,
      message: 'Receipt analyzed successfully'
    });
    console.log('Response sent successfully');

  } catch (error) {
    console.error('Analyze receipt error:', error);
    res.status(500).json({
      error: 'Failed to analyze receipt',
      details: error.message
    });
  }
};

// Helper function to generate AI insights for PDF report
async function generateReportInsights(summary, transactions, categories) {
  try {
    // Build context for AI analysis
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const overBudgetCats = expenseCategories.filter(cat => {
      const spent = parseFloat(cat.total_spent || 0);
      const budget = parseFloat(cat.budget || 0);
      return budget > 0 && spent > budget;
    });

    const dataContext = `
Data Keuangan untuk Analisis:
- Total Pemasukan: Rp ${(summary.income || 0).toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${(summary.expense || 0).toLocaleString('id-ID')}
- Balance: Rp ${(summary.balance || 0).toLocaleString('id-ID')}
- Jumlah Transaksi: ${transactions.length}
- Kategori yang Over Budget: ${overBudgetCats.length > 0 ? overBudgetCats.map(c => c.name).join(', ') : 'Tidak ada'}

${expenseCategories.length > 0 ? 'Detail Kategori:\n' + expenseCategories.slice(0, 5).map(cat => {
  const spent = parseFloat(cat.total_spent || 0);
  const budget = parseFloat(cat.budget || 0);
  const pct = budget > 0 ? ((spent / budget) * 100).toFixed(0) : 'N/A';
  return `- ${cat.name}: Rp ${spent.toLocaleString('id-ID')}${budget > 0 ? ` / Rp ${budget.toLocaleString('id-ID')} (${pct}%)` : ''}`;
}).join('\n') : ''}
`;

    const prompt = `Kamu adalah MyMo AI Assistant. Berikan analisis finansial singkat (maksimal 200 kata) dalam bahasa Indonesia dari data ini:

${dataContext}

Berikan insight dalam format natural seperti:
1. Pandangan umum tentang kondisi keuangan
2. Poin positif dari pengelolaan keuangan
3. Area yang perlu perhatian (jika ada over budget)
4. Saran konkret untuk improve

Gunakan tone personal seperti "MyMo melihat bahwa...", "MyMo merekomendasikan...", "MyMo pikir...".
Jangan gunakan bullet points, tulis dalam paragraf natural.`;

    // Try to get insights from Ollama
    for (const endpoint of OLLAMA_ENDPOINTS) {
      try {
        const response = await axios.post(
          `${endpoint}/api/generate`,
          {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false
          },
          { timeout: 15000 }
        );

        if (response.data && response.data.response) {
          return response.data.response.trim();
        }
      } catch (error) {
        console.error(`Failed to get insights from ${endpoint}:`, error.message);
      }
    }

    // Fallback if Ollama unavailable
    return 'MyMo melihat bahwa keuangan Anda perlu perhatian lebih. Pastikan untuk selalu mencatat setiap transaksi dan mengatur budget untuk setiap kategori pengeluaran agar lebih terkontrol.';
  } catch (error) {
    console.error('Error generating insights:', error);
    return 'Analisis otomatis sedang tidak tersedia. Silakan periksa data keuangan Anda secara manual.';
  }
}

// Generate PDF financial report
exports.generateReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = getCurrentMonthRange();

    // Fetch data
    const summary = await Transaction.getSummary(userId, startDate, endDate);
    const transactions = await Transaction.findByUserId(userId, { limit: 50, offset: 0 });
    const categories = await Category.findByUserIdWithCounts(userId);

    // Generate AI insights
    const insights = await generateReportInsights(summary, transactions, categories);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=mymo-report-${new Date().toISOString().split('T')[0]}.pdf`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).text('MyMo Financial Report', { align: 'center' });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
    doc.moveDown(2);

    // AI Insights Section
    doc.fontSize(16).text('Analisis MyMo', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(insights, { align: 'justify', lineGap: 4 });
    doc.moveDown(2);

    // Summary
    doc.fontSize(16).text('Ringkasan Keuangan', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11)
      .text(`Total Pemasukan: Rp ${(summary.income || 0).toLocaleString('id-ID')}`)
      .text(`Total Pengeluaran: Rp ${(summary.expense || 0).toLocaleString('id-ID')}`)
      .text(`Balance: Rp ${(summary.balance || 0).toLocaleString('id-ID')}`, { bold: true });
    doc.moveDown(2);

    // Transactions
    doc.fontSize(16).text('Transaksi Terbaru', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9);

    if (transactions && transactions.length > 0) {
      transactions.slice(0, 30).forEach((t, idx) => {
        const date = new Date(t.date).toLocaleDateString('id-ID');
        const type = t.type === 'income' ? 'Pemasukan' : 'Pengeluaran';
        const amount = `Rp ${parseFloat(t.amount).toLocaleString('id-ID')}`;
        const category = t.category_name || '-';
        doc.text(`${idx + 1}. ${date} | ${type} | ${amount} | ${category}`);
      });
    } else {
      doc.text('Tidak ada transaksi');
    }
    doc.moveDown(2);

    // Categories
    doc.fontSize(16).text('Kategori & Budget', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(9);

    const expenseCategories = categories.filter(c => c.type === 'expense');
    if (expenseCategories.length > 0) {
      expenseCategories.forEach(cat => {
        const spent = parseFloat(cat.total_spent || 0);
        const budget = parseFloat(cat.budget || 0);
        const name = cat.name || 'Unknown';
        if (budget > 0) {
          const pct = ((spent / budget) * 100).toFixed(0);
          doc.text(`${name}: Rp ${spent.toLocaleString('id-ID')} / Rp ${budget.toLocaleString('id-ID')} (${pct}%)`);
        } else {
          doc.text(`${name}: Rp ${spent.toLocaleString('id-ID')}`);
        }
      });
    } else {
      doc.text('Tidak ada kategori');
    }

    doc.end();
  } catch (error) {
    console.error('Generate report error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate report' });
    }
  }
};
