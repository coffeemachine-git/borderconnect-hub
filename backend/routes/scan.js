const express = require('express');
const multer = require('multer');
const { createWorker } = require('tesseract.js'); 
const { parse } = require('mrz');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const BorderRecord = require('../models/BorderRecord');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('documentImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document image provided' });
    }

    console.log('Cleaning and preprocessing image...');
    const processedImagePath = `uploads/clean-${req.file.filename}.png`;

    // Preprocess the image to help Tesseract read it
    await sharp(req.file.path)
      .grayscale() // Turn to black and white
      .normalize() // Stretch the contrast
      .toFile(processedImagePath);

    console.log('Starting specialized MRZ scan on cleaned image...');

   console.log('Starting MRZ scan using cropped English model...');
    
    // 1. Boot up the standard English worker (no file path bugs!)
    const worker = await createWorker('eng', 1, {
      logger: info => console.log(info.status, Math.round(info.progress * 100) + '%')
    });

    // 2. FORCE it to only see MRZ characters (this acts just like the custom mrz file)
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
      tessedit_pageseg_mode: '6', // PSM 6: Assume a single uniform block of text
    });

    // 3. Scan the perfectly cropped image
    const { data: { text } } = await worker.recognize(processedImagePath);

    // 4. Kill the worker
    await worker.terminate();

    console.log('Raw Extracted Text:\n', text);

    // Clean up text
    const cleanedText = text.replace(/ /g, '').split('\n').filter(line => line.length > 0);
    
    let parsedData = {};
    let documentType = 'Unknown';

    try {
      // 1. Try the strict, perfect parser first
      const mrzResult = parse(cleanedText);
      documentType = 'Passport';
      parsedData = {
        fullName: `${mrzResult.fields.firstName} ${mrzResult.fields.lastName}`,
        documentId: mrzResult.fields.documentNumber,
        nationality: mrzResult.fields.nationality
      };
      console.log('Strict MRZ parsing successful!');
      
    } catch (parseError) {
      console.log('Strict parsing failed. Attempting fuzzy fallback extraction...');
      
      // 2. If it fails, manually extract the data from the raw text lines
      if (cleanedText.length >= 2) {
        // Usually, line 1 has the names, line 2 has the document number
        const line1 = cleanedText[0];
        const line2 = cleanedText[1];
        
        // Document Number is usually the first 9 characters of the second line
        const docId = line2.substring(0, 9).replace(/</g, '');
        
        // Nationality is usually characters 2-5 on the first line (e.g., P<POL)
        const nat = line1.substring(2, 5).replace(/</g, '');

        // Names start after the 5th character on the first line, separated by <<
        const nameData = line1.substring(5).split('<<');
        const lastName = nameData[0] ? nameData[0].replace(/</g, ' ') : 'Unknown';
        const firstName = nameData[1] ? nameData[1].replace(/</g, ' ') : '';

        documentType = 'Passport (Auto-Recovered)';
        parsedData = {
          fullName: `${firstName} ${lastName}`.trim(),
          documentId: docId || 'Requires Manual Entry',
          nationality: nat || 'Requires Manual Entry'
        };
        console.log('Fuzzy extraction salvaged the data!');
      } else {
        // Complete failure
        parsedData = {
          fullName: 'Manual Review Required',
          documentId: 'Manual Review Required',
          nationality: 'Manual Review Required'
        };
      }
    }

    // 3. Save to MongoDB (This was already here, but now it has real data!)
    const newRecord = new BorderRecord({
      documentType: documentType,
      extractedText: cleanedText.join('\n'),
      parsedData: parsedData
    });

    await newRecord.save();
    console.log('Saved to MongoDB successfully!');

    // Clean up temporary files
    fs.unlinkSync(req.file.path);
    fs.unlinkSync(processedImagePath);

    res.status(200).json({
      message: 'Document processed',
      data: newRecord
    });

  } catch (error) {
    console.error('OCR Processing Error:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});
// GET route to fetch all scanned records from MongoDB
router.get('/', async (req, res) => {
  try {
    // Fetch all records, sorted by newest first
    const records = await BorderRecord.find().sort({ scanTimestamp: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error('Database Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch records from database' });
  }
});
// DELETE route to remove a scanned record by its MongoDB ID
router.delete('/:id', async (req, res) => {
  try {
    const recordId = req.params.id;
    const deletedRecord = await BorderRecord.findByIdAndDelete(recordId);
    
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Database Delete Error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});
module.exports = router;