const sanitizeHTML = require('sanitize-html');
const db = require('./db');
const template = require('./template');

exports.home = (req, res) => {
  const title = 'Welcome';
  const description =
    'The World Wide Web (abbreviated WWW or the Web) is an information space where documents and other web resources are identified by Uniform Resource Locators (URLs), interlinked by hypertext links, and can be accessed via the Internet.[1] English scientist Tim Berners-Lee invented the World Wide Web in 1989. He wrote the first web browser computer program in 1990 while employed at CERN in Switzerland.[2][3] The Web browser was released outside of CERN in 1991, first to other research institutions starting in January 1991 and to the general public on the Internet in August 1991.';
  const list = template.list(req.list);
  const html = template.HTML(title, list, `<a href='topic/create'>create</a>`, `<h2>${title}</h2>${description}`);

  res.send(html);
};

exports.page = (req, res, next) => {
  db.query(
    `select * from topic t left join author a on a.id = t.author_id where t.id = ?`,
    [sanitizeHTML(req.params.id)],
    (err1, result) => {
      if (err1) throw err1;

      const title = result[0].title;
      const list = template.list(req.list);
      const buttons = `<div><a href='/topic/create'>create</a>
        <a href='/topic/update/${req.params.id}'>update</a>
        <form action='/topic/delete' method='post'>
          <input type='hidden' name='id' value=${req.params.id}>
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

      res.send(html);
    }
  );
};

exports.create = (req, res) => {
  db.query(`SELECT id, name FROM author`, (err1, authors) => {
    if (err1) throw err1;

    const title = 'CREATE';
    const list = template.list(req.list);
    const buttons = '';
    const authorSelect = template.authorSelect(authors);
    const form = `<form action='/topic/create' method='post'>
        <p><input type='text' name='title' placeholder='title'></p>
        <p><textarea name='description' placeholder='description'></textarea></p>
        ${authorSelect}
        <p><input type='submit' value='create'></p>
      </form>
    `;
    const html = template.HTML(title, list, buttons, form);

    res.send(html);
  });
};

exports.create_process = (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const author_id = req.body.author_id;

  db.query(
    `INSERT INTO TOPIC(title, description, created, author_id) VALUES(?, ?, now(), ?)`,
    [sanitizeHTML(title), sanitizeHTML(description), sanitizeHTML(author_id)],
    (err, result) => {
      if (err) throw err;

      res.redirect(`/topic/${result.insertId}`);
    }
  );
};

exports.update = (req, res) => {
  db.query(`SELECT * FROM topic WHERE id = ?`, [req.params.id], (err1, results) => {
    if (err1) throw err1;

    db.query(`SELECT id, name FROM author`, (err2, authors) => {
      if (err2) throw err2;

      const title = results[0].title;
      const list = template.list(req.list);
      const buttons = '';
      const description = results[0].description;
      const authorSelect = template.authorSelect(authors, results[0].author_id);

      const form = `<form action='/topic/update' method='post'>
        <input type='hidden' name='id' value=${req.params.id}>
        <p><input type='text' name='title' value=${title}></p>
        <p><textarea name='description'>${description}</textarea></p>
        ${authorSelect}
        <p><input type='submit' value='update'></p>
      </form>
      `;
      const html = template.HTML(title, list, buttons, form);

      res.send(html);
    });
  });
};

exports.update_process = (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const author_id = req.body.author_id;

  db.query(
    `UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?`,
    [sanitizeHTML(title), sanitizeHTML(description), sanitizeHTML(author_id), id],
    (err, result) => {
      if (err) throw err;

      res.redirect(`/topic/${id}`);
    }
  );
};

exports.delete_process = (req, res) => {
  const id = req.body.id;

  db.query(`DELETE FROM topic WHERE id = ?`, [id], (err, result) => {
    if (err) throw err;

    res.redirect('/');
  });
};
