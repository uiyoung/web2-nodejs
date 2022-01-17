const sanitizeHtml = require('sanitize-html');
const db = require('./db');
const template = require('./template');

exports.home = (req, res) => {
  db.query(`SELECT * FROM author`, (err, authors) => {
    if (err) throw err;

    const title = 'author';
    const list = template.authorTable(authors);
    const buttons = '';
    const form = `<form action='/author/create' method='post'>
    <p><input type='text' name='name' placeholder='author'></p>
    <p><textarea name='profile' placeholder='profile'></textarea></p>
    <input type='submit' value='create'>
    </form>`;
    const html = template.HTML(title, list, buttons, form);

    res.writeHead(200);
    res.end(html);
  });
};

exports.create_process = (req, res) => {
  let body = '';

  req.on('data', (data) => {
    body += data;
  });

  req.on('end', () => {
    const name = new URLSearchParams(body).get('name');
    const profile = new URLSearchParams(body).get('profile');

    db.query(
      `INSERT INTO author (name, profile) VALUES (?, ?)`,
      [sanitizeHtml(name), sanitizeHtml(profile)],
      (err, result) => {
        if (err) throw err;

        res.writeHead(302, { Location: '/author' });
        res.end();
      }
    );
  });
};

exports.update = (req, res) => {
  db.query(`SELECT * FROM author`, (err, authors) => {
    if (err) throw err;

    const myURL = new URL('http://loalhost:300' + req.url);
    const id = myURL.searchParams.get('id');

    db.query(`SELECT * FROM author WHERE id = ?`, [id], (err1, result) => {
      if (err1) throw err1;

      const title = 'author';
      const list = template.authorTable(authors);
      const buttons = '';
      const form = `<form action='/author/update' method='post'>
        <input type='hidden' name='id' value=${result[0].id}>
        <p><input type='text' name='name' value=${result[0].name}></p>
        <p><textarea name='profile'>${result[0].profile}</textarea></p>
      <input type='submit' value='update'>
      </form>`;
      const html = template.HTML(title, list, buttons, form);

      res.writeHead(200);
      res.end(html);
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
    const name = new URLSearchParams(body).get('name');
    const profile = new URLSearchParams(body).get('profile');

    db.query(
      `UPDATE author SET name = ?, profile = ? WHERE id = ?`,
      [sanitizeHtml(name), sanitizeHtml(profile), id],
      (err, result) => {
        res.writeHead(302, { Location: '/author' });
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

    db.query(`DELETE FROM author WHERE id = ?`, [id], (err, result) => {
      if (err) throw err;

      res.writeHead(302, { Location: '/author' });
      res.end();
    });
  });
};
