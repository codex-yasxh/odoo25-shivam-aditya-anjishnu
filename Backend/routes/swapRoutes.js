const express = require('express');
const router = express.Router();

// Sample route
router.get('/', (req, res) => {
  res.json({ message: 'Swap route working ✅' });
});

module.exports = router;
