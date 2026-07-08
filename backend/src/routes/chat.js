const express = require('express');
const router = express.Router();
const multer = require('multer');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// All chat routes require authentication
router.use(authMiddleware);

// Send message to Ollama
router.post('/', chatController.sendMessage);

// Check Ollama connection status
router.get('/status', chatController.checkConnection);

// Generate financial report PDF
router.get('/generate-report', chatController.generateReport);

// Analyze receipt image with OCR + AI
router.post('/analyze-receipt', upload.single('image'), chatController.analyzeReceipt);

module.exports = router;
