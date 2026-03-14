const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const scanRoutes = require('./routes/scan');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Ensure MongoDB is running locally or provide a MongoDB URI)
mongoose.connect('mongosh "mongodb+srv://tranquil.irfgmgp.mongodb.net/" --apiVersion 1 --username nydhile25_db_user', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to the secure border database'))
.catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/scan', scanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));