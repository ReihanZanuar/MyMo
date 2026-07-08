const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const auth = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/',
  auth,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const ocrServiceUrl = process.env.OCR_SERVICE_URL || 'http://mymo-ocr:8000';

      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });

      const response = await axios.post(`${ocrServiceUrl}/ocr`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000
      });

      res.json(response.data);

    } catch (error) {
      console.error('OCR service error:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
          error: 'OCR service unavailable',
          message: 'Could not connect to OCR service'
        });
      }

      if (error.response) {
        return res.status(error.response.status).json({
          error: 'OCR processing failed',
          message: error.response.data?.detail || error.message
        });
      }

      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
);

module.exports = router;
