const express = require('express');
const compression = require('compression');
const db = require('./lib/db');
const topic = require('./lib/topic');
const author = require('./lib/author');

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(compression());

app.get('*', (req, res, next) => {
  db.query(`select id, title from topic`, (err, topics) => {
    if (err) {
      next(err);
    }

    req.list = topics;
    next();
  });
});

app.get('/', (req, res) => {
  res.redirect('/topic');
});

app.get('/topic', (req, res) => {
  topic.home(req, res);
});

app.get('/topic/create', (req, res) => {
  topic.create(req, res);
});

app.get('/topic/update/:id', (req, res) => {
  topic.update(req, res);
});

app.get('/topic/:id', (req, res, next) => {
  topic.page(req, res, next);
});

app.post('/topic/create', (req, res) => {
  topic.create_process(req, res);
});

app.post('/topic/update', (req, res) => {
  topic.update_process(req, res);
});

app.post('/topic/delete', (req, res) => {
  topic.delete_process(req, res);
});

app.get('/author', (req, res) => {
  author.home(req, res);
});

app.get('/author/update/:id', (req, res) => {
  author.update(req, res);
});

app.post('/author/create', (req, res) => {
  author.create_process(req, res);
});

app.post('/author/update', (req, res) => {
  author.update_process(req, res);
});

app.post('/author/delete', (req, res) => {
  author.delete_process(req, res);
});

app.use(function (req, res) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('server on port 3000');
});
