const express = require('express');
const author = require('../lib/author');
const router = express.Router();

router.get('/', (req, res) => {
  author.home(req, res);
});

router.get('/update/:id', (req, res) => {
  author.update(req, res);
});

router.post('/create', (req, res) => {
  author.create_process(req, res);
});

router.post('/update', (req, res) => {
  author.update_process(req, res);
});

router.post('/delete', (req, res) => {
  author.delete_process(req, res);
});

module.exports = router;
