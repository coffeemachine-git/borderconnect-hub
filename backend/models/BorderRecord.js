const mongoose = require('mongoose');

const borderRecordSchema = new mongoose.Schema({
  documentType: { type: String, required: true },
  extractedText: { type: String, required: true },
  parsedData: {
    fullName: String,
    documentId: String,
    nationality: String,
  },
  scanTimestamp: { type: Date, default: Date.now },
  clearanceStatus: { type: String, default: 'Pending Verification' }
});

module.exports = mongoose.model('BorderRecord', borderRecordSchema);