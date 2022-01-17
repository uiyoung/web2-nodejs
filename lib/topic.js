const { URL } = require('url');
const sanitizeHTML = require('sanitize-html');
const db = require('./db');
const template = require('./template');

exports.home = (req, res) => {
  db.query(`select * from topic`, (err, topics) => {
    if (err) throw err;
    let title = 'Welcome';
    let description =
      'The World Wide Web (abbreviated WWW or the Web) is an information space where documents and other web resources are identified by Uniform Resource Locators (URLs), interlinked by hypertext links, and can be accessed via the Internet.[1] English scientist Tim Berners-Lee invented the World Wide Web in 1989. He wrote the first web browser computer program in 1990 while employed at CERN in Switzerland.[2][3] The Web browser was released outside of CERN in 1991, first to other research institutions starting in January 1991 and to the general public on the Internet in August 1991.';
    let list = template.list(topics);
    let html = template.HTML(title, list, `<a href='create'>create</a>`, `<h2>${title}</h2>${description}`);

    res.writeHead(200);
    res.end(html);
  });
};

exports.page = (req, res) => {
  const myURL = new URL('http://localhost:3000' + req.url);
  const id = myURL.searchParams.get('id');

  db.query(`select id, title from topic`, (err, topics) => {
    if (err) throw err;

    db.query(
      `select * from topic t inner join author a on a.id = t.author_id where t.id = ?`,
      [sanitizeHTML(id)],
      (err1, result) => {
        if (err1) throw err1;

        const title = result[0].title;
        const list = template.list(topics);
        const buttons = `<div><a href='/create'>create</a>
        <a href='/update?id=${id}'>update</a>
        <form action='/delete' method='post'>
          <input type='hidden' name='id' value=${id}>
          <input type='submit' value='delete'>
        </form></div>`;
        const description = result[0].description;
        const html = template.HTML(
          title,
          list,
          buttons,
          `<h2>${title}</h2>
          ${description}
          <p><i>by ${result[0].name}</i></p>
          <p>${new Date(result[0].created).toLocaleString()}</p>`
        );

        res.writeHead(200);
        res.end(html);
      }
    );
  });
};

exports.create = (req, res) => {
  db.query(`SELECT id, title FROM TOPIC`, (err, topics) => {
    if (err) throw err;

    db.query(`SELECT id, name FROM author`, (err1, authors) => {
      if (err1) throw err1;

      const title = 'CREATE';
      const list = template.list(topics);
      const buttons = '';
      const authorSelect = template.authorSelect(authors);
      const form = `<form action='/create' method='post'>
        <p><input type='text' name='title' placeholder='title'></p>
        <p><textarea name='description' placeholder='description'></textarea></p>
        ${authorSelect}
        <p><input type='submit' value='create'></p>
      </form>
    `;

      const html = template.HTML(title, list, buttons, form);
      res.writeHead(200);
      res.end(html);
    });
  });
};

exports.create_process = (req, res) => {
  let body = '';
  // 요청의 body를 stream 형식으로 받음
  req.on('data', (data) => {
    body += data;
  });
  // 요청의 body를 다 받은 후 실행됨
  req.on('end', () => {
    const title = new URLSearchParams(body).get('title');
    const description = new URLSearchParams(body).get('description');
    const author_id = new URLSearchParams(body).get('author_id');

    db.query(
      `INSERT INTO TOPIC(title, description, created, author_id) VALUES(?, ?, now(), ?)`,
      [sanitizeHTML(title), sanitizeHTML(description), sanitizeHTML(author_id)],
      (err, results) => {
        if (err) throw err;

        res.writeHead(302, { Location: `/?id=${results.insertId}` });
        res.end();
      }
    );
  });
};

exports.update = (req, res) => {
  const myURL = new URL('http:/localhost:3000' + req.url);
  const id = myURL.searchParams.get('id');
  db.query(`SELECT id, title FROM topic`, (err, topics) => {
    if (err) throw err;

    db.query(`SELECT * FROM topic WHERE id = ?`, [id], (err1, results) => {
      if (err1) throw err1;

      db.query(`SELECT id, name FROM author`, (err2, authors) => {
        if (err2) throw err2;

        const title = results[0].title;
        const list = template.list(topics);
        const buttons = '';
        const description = results[0].description;
        const authorSelect = template.authorSelect(authors, results[0].author_id);

        const form = `<form action='/update' method='post'>
        <input type='hidden' name='id' value=${id}>
        <p><input type='text' name='title' value=${title}></p>
        <p><textarea name='description'>${description}</textarea></p>
        ${authorSelect}
        <p><input type='submit' value='update'></p>
      </form>
      `;
        const html = template.HTML(title, list, buttons, form);
        res.writeHead(200);
        res.end(html);
      });
    });
  });
};

exports.update_process = (req, res) => {
  let body = '';

  req.on('data', (data) => {
    body += data;
  });

  req.on('end', () => {
    const id = new URLSearchParams(body).get('id');
    const title = new URLSearchParams(body).get('title');
    const description = new URLSearchParams(body).get('description');
    const author_id = new URLSearchParams(body).get('author_id');

    db.query(
      `UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?`,
      [sanitizeHTML(title), sanitizeHTML(description), sanitizeHTML(author_id), id],
      (err, result) => {
        if (err) throw err;

        res.writeHead(302, { Location: `/?id=${id}` });
        res.end();
      }
    );
  });
};

exports.delete_process = (req, res) => {
  let body = '';

  req.on('data', (data) => {
    body += data;
  });

  req.on('end', () => {
    const id = new URLSearchParams(body).get('id');

    db.query(`DELETE FROM topic WHERE id = ?`, [id], (err, result) => {
      if (err) throw err;

      res.writeHead(302, { Location: '/' });
      res.end();
    });
  });
};
