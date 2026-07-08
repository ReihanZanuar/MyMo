<template>
  <div class="chatbox-container">
    <!-- Chat Toggle Button -->
    <button
      v-if="!isOpen"
      class="chat-toggle-btn"
      @click="isOpen = true"
      title="Buka Chat"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </button>

    <!-- Chat Window -->
    <div v-if="isOpen" class="chat-window" :class="{ 'panel-mode': isPanelMode }">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-content">
          <div class="chat-icon">
            <img src="/Attachment/MyMo-Assistant.svg?v=3" alt="MyMo Assistant" />
          </div>
          <div>
            <h3>MyMo Assistant</h3>
            <p class="status">Online</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="download-btn" @click="downloadReport" :disabled="isDownloading" title="Download Laporan PDF">
            <svg v-if="!isDownloading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span v-else class="spinner"></span>
          </button>
          <button class="panel-toggle-btn" @click="isPanelMode = !isPanelMode" :title="isPanelMode ? 'Mode Float' : 'Mode Panel'">
            <svg v-if="!isPanelMode" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="18"></rect>
              <rect x="14" y="3" width="7" height="18"></rect>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button class="close-btn" @click="isOpen = false" title="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="messages-area" ref="messagesArea">
        <!-- Image Preview -->
        <div v-if="imagePreviewUrl" class="image-preview-container">
          <img :src="imagePreviewUrl" alt="Preview Struk" />
          <button @click="clearImage" class="clear-preview-btn">×</button>
          <button @click="analyzeReceipt" :disabled="isAnalyzing" class="analyze-btn">
            {{ isAnalyzing ? 'Menganalisis...' : 'Analisis Struk' }}
          </button>
        </div>

        <!-- Transaction Confirmation -->
        <div v-if="extractedTransaction" class="transaction-confirmation">
          <h4>Data dari Struk:</h4>
          <p><strong>Jumlah:</strong> Rp {{ extractedTransaction.amount?.toLocaleString('id-ID') }}</p>
          <p><strong>Tanggal:</strong> {{ extractedTransaction.date }}</p>
          <p><strong>Deskripsi:</strong> {{ extractedTransaction.description }}</p>
          <p><strong>Kategori:</strong> {{ extractedTransaction.categoryName }}</p>
          <p class="choice-label">Masukkan sebagai:</p>
          <div class="confirmation-actions">
            <button @click="confirmTransaction('expense')" class="confirm-btn expense-btn">Pengeluaran</button>
            <button @click="confirmTransaction('income')" class="confirm-btn income-btn">Pemasukan</button>
            <button @click="cancelTransaction" class="cancel-btn">Batal</button>
          </div>
        </div>

        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </div>
          <h4>Selamat Datang!</h4>
          <p>Halo! Ada yang bisa saya bantu?</p>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-content">
            <div class="message-text" v-html="parseMarkdown(message.text)"></div>
            <span class="message-time">{{ message.time }}</span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <input
          type="file"
          ref="fileInput"
          accept="image/*"
          style="display: none"
          @change="handleImageSelect"
        />
        <button class="attach-btn" @click="$refs.fileInput.click()" title="Upload Struk">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
        <input
          v-model="inputMessage"
          type="text"
          placeholder="Ketik pesan..."
          @keypress.enter="sendMessage"
          class="message-input"
        />
        <button
          @click="sendMessage"
          class="send-btn"
          :disabled="!inputMessage.trim()"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { marked } from 'marked'
import { chatService } from '../services/chat'
import { transactionService } from '../services/transactions'

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref([])
const messagesArea = ref(null)
const abortController = ref(null)
const isDownloading = ref(false)
const isPanelMode = ref(false)
const selectedImage = ref(null)
const imagePreviewUrl = ref(null)
const isAnalyzing = ref(false)
const extractedTransaction = ref(null)
const fileInput = ref(null)

// Watch panel mode and update body class for layout adjustment
watch(isPanelMode, (newVal) => {
  if (newVal) {
    document.body.classList.add('chat-panel-active')
  } else {
    document.body.classList.remove('chat-panel-active')
  }
})

// Watch chat open state - remove body class when chat closes
watch(isOpen, (newVal) => {
  if (!newVal) {
    // When chat closes, always remove the panel-active class
    document.body.classList.remove('chat-panel-active')
  } else {
    // When chat opens, add the class only if panel mode is active
    if (isPanelMode.value) {
      document.body.classList.add('chat-panel-active')
    }
  }
})

async function downloadReport() {
  try {
    isDownloading.value = true
    const token = localStorage.getItem('token')
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

    const response = await fetch(`${API_BASE_URL}/chat/generate-report`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to generate report')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mymo-report-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download report error:', error)
    alert('Gagal generate laporan. Pastikan Anda sudah login.')
  } finally {
    isDownloading.value = false
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim()) return

  if (abortController.value) {
    abortController.value.abort()
  }

  abortController.value = new AbortController()

  const userMessage = {
    type: 'user',
    text: inputMessage.value,
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  messages.value.push(userMessage)
  const userInput = inputMessage.value
  inputMessage.value = ''

  scrollToBottom()

  const loadingMessage = {
    type: 'bot',
    text: 'Menghubungkan...',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    isLoading: true
  }
  messages.value.push(loadingMessage)
  scrollToBottom()

  try {
    await chatService.sendMessageStreaming(
      userInput,
      messages.value.filter(m => !m.isLoading && !m.isStreaming),
      {
        onLoading: (loadingText) => {
          const loadingMsg = messages.value.find(m => m.isLoading)
          if (loadingMsg) {
            loadingMsg.text = loadingText
          }
          scrollToBottom()
        },
        onChunk: (content) => {
          if (messages.value.some(m => m.isLoading)) {
            messages.value = messages.value.filter(m => !m.isLoading)
          }

          const botMsgIndex = messages.value.findIndex(m => m.isStreaming)

          if (botMsgIndex === -1) {
            messages.value.push({
              type: 'bot',
              text: content,
              time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              isStreaming: true
            })
          } else {
            messages.value[botMsgIndex].text += content
          }
          scrollToBottom()
        },
        onDone: (metadata) => {
          const botMsgIndex = messages.value.findIndex(m => m.isStreaming)
          if (botMsgIndex !== -1) {
            messages.value[botMsgIndex].isStreaming = false
          }
          console.log('Streaming complete:', metadata)
        },
        onError: (errorText) => {
          console.error('Chat error:', errorText)
          messages.value = messages.value.filter(m => !m.isLoading && !m.isStreaming)

          const errorMessage = {
            type: 'bot',
            text: errorText || 'Maaf, terjadi kesalahan. Pastikan Ollama server sedang berjalan.',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
          messages.value.push(errorMessage)
          scrollToBottom()
        }
      },
      abortController.value.signal
    )
  } catch (error) {
    console.error('Chat error:', error)
    messages.value = messages.value.filter(m => !m.isLoading && !m.isStreaming)

    const errorMessage = {
      type: 'bot',
      text: 'Maaf, terjadi kesalahan. Pastikan Ollama server sedang berjalan.',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(errorMessage)
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight
    }
  })
}

function parseMarkdown(text) {
  if (!text) return ''
  return marked.parse(text, { breaks: true, gfm: true })
}

function handleImageSelect(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    selectedImage.value = file
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

async function analyzeReceipt() {
  if (!selectedImage.value) return
  isAnalyzing.value = true

  try {
    const result = await chatService.analyzeReceipt(selectedImage.value)
    extractedTransaction.value = result.transaction

    messages.value.push({
      type: 'bot',
      text: `Saya menemukan transaksi:\n- Jumlah: Rp ${result.transaction.amount?.toLocaleString('id-ID')}\n- Tanggal: ${result.transaction.date}\n- Deskripsi: ${result.transaction.description}\n- Kategori: ${result.transaction.categoryName}\n\nApakah kamu mau saya masukkan ini ke transaksi?`,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  } catch (error) {
    messages.value.push({
      type: 'bot',
      text: 'Maaf, gagal menganalisis struk. ' + error.message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  } finally {
    isAnalyzing.value = false
  }
}

async function confirmTransaction(type) {
  try {
    const transactionData = {
      walletId: extractedTransaction.value.walletId,
      categoryId: extractedTransaction.value.categoryId,
      amount: extractedTransaction.value.amount,
      type: type,
      description: extractedTransaction.value.description,
      date: extractedTransaction.value.date
    }

    await transactionService.createTransaction(transactionData)

    messages.value.push({
      type: 'bot',
      text: 'Transaksi berhasil dicatat! 🎉',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })

    clearImage()
    extractedTransaction.value = null
    scrollToBottom()

    // Reset chat after 2 seconds
    setTimeout(() => {
      messages.value = []
    }, 2000)
  } catch (error) {
    messages.value.push({
      type: 'bot',
      text: 'Gagal mencatat transaksi: ' + error.message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
}

function cancelTransaction() {
  extractedTransaction.value = null
  clearImage()
  messages.value.push({
    type: 'bot',
    text: 'Baik, transaksi dibatalkan.',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()

  // Reset chat after 2 seconds
  setTimeout(() => {
    messages.value = []
  }, 2000)
}

function clearImage() {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }
  selectedImage.value = null
  imagePreviewUrl.value = null
}

</script>

<style scoped>
.chatbox-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 999;
}

.chat-toggle-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.chat-toggle-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.chat-window {
  width: 420px;
  height: 550px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  transition: width 0.3s ease, height 0.3s ease;
}

.chat-window.panel-mode {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 450px;
  height: 100vh;
  border-radius: 16px 0 0 16px;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.download-btn,
.panel-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s ease;
}

.download-btn:hover:not(:disabled),
.panel-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.chat-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.chat-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
}

.status {
  font-size: 0.75rem;
  opacity: 0.9;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.messages-area {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background: #f9fafb;
}

.welcome-message {
  text-align: center;
  padding: 2rem 1rem;
}

.welcome-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
}

.welcome-message h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.welcome-message p {
  color: #6b7280;
  margin: 0;
}

.message {
  margin-bottom: 1rem;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.bot {
  justify-content: flex-start;
}

.message-content {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .message-content {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.message-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
}

.message-text :deep(p) {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-text :deep(em) {
  font-style: italic;
}

.message-text :deep(ul),
.message-text :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  word-wrap: break-word;
}

.message-text :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-text :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.85em;
  font-family: 'Monaco', 'Menlo', monospace;
  word-break: break-all;
}

.message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5rem 0;
  max-width: 100%;
}

.message-text :deep(pre code) {
  background: none;
  padding: 0;
}

.message-text :deep(table) {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.8rem;
  display: block;
  overflow-x: auto;
}

.message-text :deep(table th),
.message-text :deep(table td) {
  padding: 0.4rem;
  border: 1px solid #e5e7eb;
  text-align: left;
  word-wrap: break-word;
  max-width: 150px;
}

.message-text :deep(table th) {
  background: rgba(102, 126, 234, 0.1);
  font-weight: 600;
}

.message-text :deep(table tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.02);
}

.input-area {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.5rem;
}

.message-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;
  background: white;
  color: #1f2937;
}

.message-input::placeholder {
  color: #9ca3af;
}

.message-input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Dark Mode */
.dark .chat-window {
  background: rgba(30, 30, 45, 0.98);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.dark .messages-area {
  background: rgba(15, 15, 25, 0.5);
}

.dark .welcome-message h4 {
  color: #f3f4f6;
}

.dark .welcome-message p {
  color: #9ca3af;
}

.dark .message.bot .message-content {
  background: rgba(30, 30, 45, 0.8);
  border-color: rgba(102, 126, 234, 0.2);
  color: #e5e7eb;
}

.dark .input-area {
  background: rgba(30, 30, 45, 0.8);
  border-top-color: rgba(102, 126, 234, 0.2);
}

.dark .message-input {
  background: rgba(15, 15, 25, 0.8);
  border-color: rgba(102, 126, 234, 0.3);
  color: #f3f4f6;
}

.dark .message-input::placeholder {
  color: #6b7280;
}

.dark .message-input:focus {
  border-color: #8b9bea;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .chatbox-container {
    bottom: calc(85px + env(safe-area-inset-bottom)); /* Pindah ke atas bottom navigation */
    right: 1rem;
  }

  .chat-window {
    width: calc(100vw - 2rem);
    max-width: 420px;
    height: 500px;
  }
}

/* Receipt Upload Styles */
.attach-btn {
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.attach-btn:hover {
  background: #e5e7eb;
  color: #667eea;
}

.image-preview-container {
  margin: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #d1d5db;
  text-align: center;
  position: relative;
}

.image-preview-container img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-bottom: 0.75rem;
}

.clear-preview-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: background 0.2s ease;
}

.clear-preview-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.analyze-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.transaction-confirmation {
  margin: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
}

.transaction-confirmation h4 {
  margin: 0 0 0.75rem 0;
  color: #667eea;
  font-size: 1rem;
  font-weight: 600;
}

.transaction-confirmation p {
  margin: 0.5rem 0;
  color: #1f2937;
  font-size: 0.875rem;
}

.confirmation-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.confirmation-actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.cancel-btn {
  background: #f3f4f6;
  color: #6b7280;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

.choice-label {
  margin: 0.75rem 0 0.5rem 0;
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 600;
}

.expense-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.expense-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.income-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.income-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.dark .image-preview-container {
  background: rgba(30, 30, 45, 0.8);
  border-color: rgba(102, 126, 234, 0.3);
}

.dark .transaction-confirmation {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  border-color: #8b9bea;
}

.dark .transaction-confirmation h4 {
  color: #8b9bea;
}

.dark .transaction-confirmation p {
  color: #e5e7eb;
}

.dark .choice-label {
  color: #d1d5db;
}

.dark .attach-btn {
  background: rgba(30, 30, 45, 0.8);
  border-color: rgba(102, 126, 234, 0.3);
  color: #9ca3af;
}

.dark .attach-btn:hover {
  background: rgba(40, 40, 55, 0.8);
  color: #8b9bea;
}

.dark .cancel-btn {
  background: rgba(30, 30, 45, 0.8);
  color: #9ca3af;
}

.dark .cancel-btn:hover {
  background: rgba(40, 40, 55, 0.8);
}
</style>
