const http = require('http');
const fs = require('fs');
const { URL, URLSearchParams } = require('url');
const sanitizeHTML = require('sanitize-html');
const path = require('path');
const template = require('./lib/template');

const app = http.createServer((req, res) => {
  const url = req.url;
  const myURL = new URL('http://localhost:3000' + url);
  const pathname = myURL.pathname;
  const queryData = myURL.searchParams;

  if (pathname === '/') {
    if (queryData.get('id') === null) {
      fs.readdir('./data', (err, files) => {
        let title = 'Welcome';
        let description =
          'The World Wide Web (abbreviated WWW or the Web) is an information space where documents and other web resources are identified by Uniform Resource Locators (URLs), interlinked by hypertext links, and can be accessed via the Internet.[1] English scientist Tim Berners-Lee invented the World Wide Web in 1989. He wrote the first web browser computer program in 1990 while employed at CERN in Switzerland.[2][3] The Web browser was released outside of CERN in 1991, first to other research institutions starting in January 1991 and to the general public on the Internet in August 1991.';
        let list = template.list(files);
        let html = template.HTML(title, list, `<a href='create'>create</a>`, `<h2>${title}</h2>${description}`);

        res.writeHead(200);
        res.end(html);
      });
    } else {
      fs.readdir('./data', (err, files) => {
        let id = queryData.get('id');
        const filteredId = path.parse(id).base;

        fs.readFile(`./data/${filteredId}`, 'utf-8', (err, data) => {
          let list = template.list(files);
          let buttons = `<a href='create'>create</a>
          <a href='update?id=${filteredId}'>update</a>
          <form action='/delete' method='POST'>
            <input type='hidden' name='id' value=${filteredId}>
            <input type='submit' value='delete'>
          </form>`;
          let description = sanitizeHTML(data);
          let html = template.HTML(filteredId, list, buttons, `<h2>${filteredId}</h2>${description}`);

          res.writeHead(200);
          res.end(html);
        });
      });
    }
  } else if (pathname === '/create') {
    if (req.method === 'GET') {
      fs.readdir('./data', (err, files) => {
        let title = 'CREATE';
        let list = template.list(files);
        let form = `
        <form action="/create" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p><textarea name="description" placeholder="description"></textarea></p>
        <p><input type="submit"></p>
        </form>`;
        let html = template.HTML(title, list, '', form);

        res.writeHead(200);
        res.end(html);
      });
    } else if (req.method === 'POST') {
      let body = '';
      // 요청의 body를 stream 형식으로 받음
      req.on('data', (data) => {
        body += data;
      });
      // 요청의 body를 다 받은 후 실행됨
      req.on('end', () => {
        let title = new URLSearchParams(body).get('title');
        let description = new URLSearchParams(body).get('description');

        fs.writeFile(`./data/${title}`, description, 'utf-8', (err) => {
          if (err) throw err;
          console.log('The file has been saved!');
          res.writeHead(302, { Location: `/?id=${title}` });
          res.end();
        });
      });
    }
  } else if (pathname === '/update') {
    if (req.method === 'GET') {
      fs.readdir('./data', (err, files) => {
        let list = template.list(files);
        let title = queryData.get('id');
        const filteredId = path.parse(title).base;

        fs.readFile(`./data/${filteredId}`, 'utf-8', (err, data) => {
          let description = data;
          let form = `
          <form action="/update" method="post">
          <input type='hidden' name='id' value=${filteredId}>
          <p><input type="text" name="title" placeholder="title" value = ${filteredId}></p>
          <p><textarea name="description" placeholder="description">${description}</textarea></p>
          <p><input type="submit"></p>
          </form>`;
          let html = template.HTML(filteredId, list, '', form);

          res.writeHead(200);
          res.end(html);
        });
      });
    } else if (req.method === 'POST') {
      let body = '';

      req.on('data', (data) => {
        body += data;
      });

      req.on('end', () => {
        let id = new URLSearchParams(body).get('id');
        let title = new URLSearchParams(body).get('title');
        let description = new URLSearchParams(body).get('description');

        fs.rename(`./data/${id}`, `./data/${title}`, (err) => {
          if (err) throw err;

          fs.writeFile(`./data/${title}`, description, 'utf-8', (err) => {
            if (err) throw err;
            console.log('the file has been saved!');
            res.writeHead(302, { Location: `/?id=${title}` });
            res.end();
          });
        });
      });
    }
  } else if (pathname === '/delete') {
    let body = '';
    req.on('data', (data) => {
      body += data;
    });
    req.on('end', () => {
      let id = new URLSearchParams(body).get('id');
      const filteredId = path.parse(id).base;
      fs.unlink(`./data/${filteredId}`, (err) => {
        if (err) throw err;

        console.log('file deleted');
        res.writeHead(302, { Location: '/' });
        res.end();
      });
    });
  } else {
    res.writeHead(404);
    res.end('not found');
  }
});
app.listen(3000);

app.on('listening', () => {
  console.log('server on port 3000');
});
