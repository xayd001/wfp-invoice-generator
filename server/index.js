const express = require('express');
const cors = require('cors');
const path = require('path');
const { ToWords } = require('to-words');

const app = express();
const PORT = process.env.PORT || 5000;

const toWords = new ToWords({
  localeCode: 'en-US',
  converterOptions: {
    currency: true,
    ignoreDecimal: true,
    ignoreZeroCurrency: true,
    currencyOptions: {
      name: 'Naira',
      plural: 'Naira',
      symbol: 'NGN',
    },
  },
});

app.use(cors());
app.use(express.json());

// API Route for calculations
app.post('/api/calculate', (req, res) => {
  const { stoItems = [] } = req.body;

  let grandTotal = 0;
  stoItems.forEach((item) => {
    const rate = parseFloat(item.rate) || 0;
    const qty = parseFloat(item.qty) || 0;
    grandTotal += rate * qty;
  });

  let amountInWords = '';
  if (grandTotal > 0) {
    try {
      amountInWords = toWords.convert(Math.floor(grandTotal)) + ' Only';
    } catch (e) {
      amountInWords = '';
    }
  }

  res.json({ grandTotal, amountInWords });
});

// Serve static frontend build files in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback to index.html for all non-API client routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Production server running on http://localhost:${PORT}`);
});