const express = require('express');
const router = express.Router();

router.get('/:mode', (req, res) => {
  res.cookie('theme', req.params.mode);
  res.send(`<script>window.location = document.referrer;</script>`);
});

module.exports = router;
