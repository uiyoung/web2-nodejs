const express = require('express');
const topic = require('../lib/topic');

const router = express.Router();

router.get('/', (req, res) => {
  topic.home(req, res);
});

router.get('/create', (req, res) => {
  topic.create(req, res);
});

router.get('/update/:id', (req, res) => {
  topic.update(req, res);
});

router.get('/:id', (req, res, next) => {
  topic.page(req, res, next);
});

router.post('/create', (req, res) => {
  topic.create_process(req, res);
});

router.post('/update', (req, res) => {
  topic.update_process(req, res);
});

router.post('/delete', (req, res) => {
  topic.delete_process(req, res);
});

module.exports = router;
