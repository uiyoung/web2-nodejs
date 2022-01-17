const http = require('http');
const { URL } = require('url');
const sanitizeHTML = require('sanitize-html');
const topic = require('./lib/topic');
const author = require('./lib/author');

const app = http.createServer((req, res) => {
  const url = req.url;
  const myURL = new URL('http://localhost:3000' + url);
  const pathname = myURL.pathname;
  const queryData = myURL.searchParams;

  console.log(req.method, req.url);
  try {
    if (req.method === 'GET') {
      if (pathname === '/') {
        if (sanitizeHTML(queryData.get('id')) === null || sanitizeHTML(queryData.get('id')) === '') {
          topic.home(req, res);
        } else {
          topic.page(req, res);
        }
      } else if (pathname === '/create') {
        topic.create(req, res);
      } else if (pathname === '/update') {
        topic.update(req, res);
      } else if (pathname === '/author') {
        author.home(req, res);
      } else if (pathname === '/author/update') {
        author.update(req, res);
      } else {
        res.writeHead(404);
        res.end('not found');
      }
    } else if (req.method === 'POST') {
      if (pathname === '/create') {
        topic.create_process(req, res);
      } else if (pathname === '/update') {
        topic.update_process(req, res);
      } else if (pathname === '/delete') {
        topic.delete_process(req, res);
      } else if (pathname === '/author/create') {
        author.create_process(req, res);
      } else if (pathname === '/author/update') {
        author.update_process(req, res);
      } else if (pathname === '/author/delete') {
        author.delete_process(req, res);
      } else {
        res.writeHead(404);
        res.end('not found');
      }
    }
  } catch (error) {
    console.error(error);

    res.writeHead(500);
    res.end();
  }
});
app.listen(3000);

app.on('listening', () => {
  console.log('server on port 3000');
});
