import jsQR from 'jsqr'

export function parseReceipt(text) {
  const result = {
    amount: null,
    date: null,
    merchant: null,
    description: null,
    type: 'expense'
  }

  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  result.merchant = detectMerchant(lines)
  result.amount = extractAmount(lines)
  result.date = extractDate(lines)
  result.description = generateDescription(lines, result.merchant)

  return result
}

function looksLikeDate(num) {
  const str = String(num)
  if (str.length !== 6) return false

  const a = parseInt(str.substring(0, 2))
  const b = parseInt(str.substring(2, 4))
  const c = parseInt(str.substring(4, 6))

  // YYMMDD: year 20-30, month 01-12, day 01-31
  if (a >= 20 && a <= 30 && b >= 1 && b <= 12 && c >= 1 && c <= 31) return true

  // DDMMYY: day 01-31, month 01-12, year 20-30
  if (a >= 1 && a <= 31 && b >= 1 && b <= 12 && c >= 20 && c <= 30) return true

  return false
}

function detectMerchant(lines) {
  const merchants = [
    { pattern: /indomaret/i, name: 'Indomaret' },
    { pattern: /alfamart/i, name: 'Alfamart' },
    { pattern: /bca/i, name: 'BCA' },
    { pattern: /mandiri/i, name: 'Bank Mandiri' },
    { pattern: /bni/i, name: 'BNI' },
    { pattern: /bri/i, name: 'BRI' },
    { pattern: /gopay/i, name: 'GoPay' },
    { pattern: /ovo/i, name: 'OVO' },
    { pattern: /dana/i, name: 'DANA' },
    { pattern: /shopee/i, name: 'ShopeePay' }
  ]

  for (const line of lines.slice(0, 5)) {
    for (const merchant of merchants) {
      if (merchant.pattern.test(line)) {
        return merchant.name
      }
    }
  }

  return 'Toko/Merchant'
}

function extractAmount(lines) {
  // HIGHEST PRIORITY: Look for "Rp" with amount (most common in digital receipts)
  for (const line of lines) {
    // Skip lines with fee keywords
    if (/biaya|fee|charge/i.test(line)) continue

    // Skip lines with transaction IDs (pattern: 123456-ABC-XYZ or 123456-A1B2C3)
    if (/\d{4,}[-][A-Z0-9]/i.test(line)) continue

    // Match "Rp" followed by numbers with thousand separators (e.g., "Rp18.759" or "Rp 18.759")
    const match = line.match(/rp\.?\s*([\d]{1,3}(?:[.,]\d{3})+)/i)
    if (match) {
      const amountStr = match[1].replace(/[.,]/g, '')
      const amount = parseInt(amountStr)
      if (amount >= 100 && amount < 100000000 && amountStr.length >= 3 && amountStr.length <= 9) {
        return amount
      }
    }

    // Also try "Rp" followed by 4-9 digits without separators (OCR might drop the separator)
    const match2 = line.match(/rp\.?\s*(\d{4,9})\b/i)
    if (match2) {
      const amount = parseInt(match2[1])
      // Reasonable transaction: 1,000 to 999,999,999
      if (amount >= 1000 && amount < 1000000000) {
        return amount
      }
    }
  }

  // Priority patterns with context keywords (with Rp)
  const priorityPatternsWithRp = [
    /total[:\s]+rp\.?\s*([\d.,]+)/i,
    /jumlah[:\s]+rp\.?\s*([\d.,]+)/i,
    /bayar[:\s]+rp\.?\s*([\d.,]+)/i,
    /grand\s+total[:\s]+rp\.?\s*([\d.,]+)/i,
    /nominal[:\s]+rp\.?\s*([\d.,]+)/i
  ]

  for (const line of lines) {
    // Skip fee lines
    if (/biaya|fee/i.test(line)) continue

    for (const pattern of priorityPatternsWithRp) {
      const match = line.match(pattern)
      if (match) {
        const amountStr = match[1].replace(/[.,]/g, '')
        const amount = parseInt(amountStr)
        if (amount > 0 && amount < 100000000 && amountStr.length <= 10) {
          return amount
        }
      }
    }
  }

  // Secondary: look for "Rp" followed by numbers anywhere (broader match)
  for (const line of lines) {
    // Skip problematic patterns
    if (/biaya|fee|account|pan|merchant|id\s*:/i.test(line)) continue

    const match = line.match(/rp\.?\s*([\d.,]+)/i)
    if (match) {
      const amountStr = match[1].replace(/[.,]/g, '')
      const amount = parseInt(amountStr)
      // More strict validation: amount should be reasonable and not too long
      if (amount > 0 && amount < 100000000 && amountStr.length >= 3 && amountStr.length <= 9) {
        return amount
      }
    }
  }

  // Look for standalone numbers with thousand separators
  for (const line of lines) {
    // Skip lines that look like account numbers, IDs, PAN numbers, etc.
    if (/account|pan|merchant|pelanggan|no\.|id|terminal|referensi|jago\s+\d/i.test(line)) {
      continue
    }
    // Skip lines with very long numbers (10+ digits continuous)
    if (/\d{10,}/.test(line)) {
      continue
    }

    const match = line.match(/\b(\d{1,3}(?:[.,]\d{3})+)\b/)
    if (match) {
      const amountStr = match[1].replace(/[.,]/g, '')
      const amount = parseInt(amountStr)
      // Should be a reasonable amount (1,000 to 100 million)
      if (amount >= 1000 && amount < 100000000 && amountStr.length <= 9) {
        return amount
      }
    }
  }

  // Last resort: find reasonable numbers
  const numberMatches = []
  for (const line of lines) {
    // Skip lines with very long numbers or known ID patterns
    if (/^\d{10,}$/.test(line.trim()) ||
        /account|pan|merchant|pelanggan|no\.|id|terminal|referensi|jago/i.test(line)) {
      continue
    }

    const matches = line.match(/\b\d{3,8}\b/g)
    if (matches) {
      for (const match of matches) {
        const num = parseInt(match)
        // Skip date-like 6-digit numbers (YYMMDD or DDMMYY format like "260702")
        if (looksLikeDate(num)) continue
        // Reasonable transaction amounts: 1,000 to 100 million
        if (num >= 1000 && num < 100000000) {
          numberMatches.push(num)
        }
      }
    }
  }

  if (numberMatches.length > 0) {
    numberMatches.sort((a, b) => a - b)
    // Use median to avoid outliers
    return numberMatches[Math.floor(numberMatches.length / 2)]
  }

  return null
}

function extractDate(lines) {
  // Priority patterns with context keywords (check these first)
  const priorityPatterns = [
    // Text month formats with context
    { regex: /tanggal[^:]*[:\s]+(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{2,4})/i, type: 'text-month' },
    { regex: /date[^:]*[:\s]+(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{2,4})/i, type: 'text-month' },
    { regex: /transaksi[^:]*[:\s]+(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{2,4})/i, type: 'text-month' },

    // Numeric formats with context: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    { regex: /tanggal[:\s]+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i, type: 'dmy' },
    { regex: /date[:\s]+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i, type: 'dmy' },
    { regex: /transaksi[:\s]+(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/i, type: 'dmy' },

    // ISO format with context: YYYY-MM-DD, YYYY/MM/DD
    { regex: /tanggal[:\s]+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i, type: 'ymd' },
    { regex: /date[:\s]+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i, type: 'ymd' },
    { regex: /transaksi[:\s]+(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/i, type: 'ymd' }
  ]

  // Check priority patterns first
  for (const line of lines) {
    for (const { regex, type } of priorityPatterns) {
      const match = line.match(regex)
      if (match) {
        try {
          let day, month, year

          if (type === 'text-month') {
            day = parseInt(match[1])
            month = parseMonth(match[2])
            year = parseInt(match[3])
          } else if (type === 'dmy') {
            day = parseInt(match[1])
            month = parseInt(match[2])
            year = parseInt(match[3])
          } else if (type === 'ymd') {
            year = parseInt(match[1])
            month = parseInt(match[2])
            day = parseInt(match[3])
          }

          if (year < 100) {
            year += 2000
          }

          if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 2020 && year <= 2030) {
            const monthStr = String(month).padStart(2, '0')
            const dayStr = String(day).padStart(2, '0')
            return `${year}-${monthStr}-${dayStr}`
          }
        } catch (e) {
          continue
        }
      }
    }
  }

  // Fallback: general date patterns (without context keywords)
  const fallbackPatterns = [
    // Text month: DD Mon YYYY
    { regex: /(\d{1,2})\s+(jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s+(\d{2,4})/i, type: 'text-month' },

    // ISO format: YYYY-MM-DD, YYYY/MM/DD
    { regex: /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/, type: 'ymd' },

    // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (most common in Indonesia)
    { regex: /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/, type: 'dmy-or-mdy' }
  ]

  for (const line of lines) {
    for (const { regex, type } of fallbackPatterns) {
      const match = line.match(regex)
      if (match) {
        try {
          let day, month, year

          if (type === 'text-month') {
            day = parseInt(match[1])
            month = parseMonth(match[2])
            year = parseInt(match[3])
          } else if (type === 'ymd') {
            year = parseInt(match[1])
            month = parseInt(match[2])
            day = parseInt(match[3])
          } else if (type === 'dmy-or-mdy') {
            // Try DD/MM/YYYY first (more common in Indonesia)
            day = parseInt(match[1])
            month = parseInt(match[2])
            year = parseInt(match[3])

            // If day > 12, it must be DD/MM format
            // If month > 12, it must be MM/DD format, swap them
            if (month > 12) {
              const temp = day
              day = month
              month = temp
            }
          }

          if (year < 100) {
            year += 2000
          }

          if (day > 0 && day <= 31 && month > 0 && month <= 12 && year >= 2020 && year <= 2030) {
            const monthStr = String(month).padStart(2, '0')
            const dayStr = String(day).padStart(2, '0')
            return `${year}-${monthStr}-${dayStr}`
          }
        } catch (e) {
          continue
        }
      }
    }
  }

  return new Date().toISOString().split('T')[0]
}

function parseMonth(monthStr) {
  const months = {
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'mei': 5, 'jun': 6,
    'jul': 7, 'agu': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'des': 12
  }
  return months[monthStr.toLowerCase().substring(0, 3)] || 1
}

function generateDescription(lines, merchant) {
  const descriptions = []

  for (const line of lines) {
    if (line.length > 5 && line.length < 50) {
      if (!/^\d+$/.test(line) && !/^rp/i.test(line)) {
        descriptions.push(line)
      }
    }
  }

  if (descriptions.length > 0) {
    return `${merchant} - ${descriptions[0]}`
  }

  return `Transaksi ${merchant}`
}

export async function decodeQRFromImage(imageFile) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          resolve(code.data)
        } else {
          resolve(null)
        }
      }
      img.src = e.target.result
    }

    reader.onerror = reject
    reader.readAsDataURL(imageFile)
  })
}

export function parseQRISData(qrData) {
  try {
    const result = {
      amount: null,
      merchant: null,
      description: 'Pembayaran QRIS'
    }

    const amountMatch = qrData.match(/54(\d{2})(\d+)/)
    if (amountMatch) {
      const length = parseInt(amountMatch[1])
      const amount = parseFloat(qrData.substr(amountMatch.index + 4, length))
      if (amount > 0) {
        result.amount = Math.round(amount)
      }
    }

    const merchantMatch = qrData.match(/59(\d{2})(.+?)60/)
    if (merchantMatch) {
      const length = parseInt(merchantMatch[1])
      result.merchant = qrData.substr(merchantMatch.index + 4, length)
      result.description = `QRIS - ${result.merchant}`
    }

    return result
  } catch (e) {
    return null
  }
}
