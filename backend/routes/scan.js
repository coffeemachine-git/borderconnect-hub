const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const BorderRecord = require('../models/BorderRecord');

const router = express.Router();

// Configure multer to temporarily store uploaded document images
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('documentImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document image provided' });
    }

    console.log('Starting OCR process...');

    // Run OCR on the uploaded image
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'eng',
      { logger: info => console.log(info.status, info.progress) }
    );

    // TODO: Implement parsing logic (RegEx or AI) to extract specific fields from 'text'
    // For now, saving raw text and placeholder parsed data
    const newRecord = new BorderRecord({
      documentType: 'Unknown ID', 
      extractedText: text,
      parsedData: {
        fullName: 'Requires Regex Extraction', 
        documentId: 'Requires Regex Extraction',
        nationality: 'Requires Regex Extraction'
      }
    });

    // Save data correctly to MongoDB
    await newRecord.save();

    res.status(200).json({
      message: 'Document scanned and recorded successfully',
      data: newRecord
    });

  } catch (error) {
    console.error('OCR Processing Error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

module.exports = router;