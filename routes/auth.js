const express = require('express');
const template = require('../lib/template');
const router = express.Router();
const db = require('../lib/db');

router.get('/login', (req, res) => {
  const title = 'WEB - login';
  const form = `
  <form action='/auth/login' method='post'>
    <p><input type='email' name='email' placeholder='email'></p>
    <p><input type='password' name='password' placeholder='password'></p>
    <input type='submit' value='login'>
  </form>`;
  const html = template.HTML('title', '', '', `<h2>login</h2>${form}`);

  res.send(html);
});

router.post('/login', (req, res) => {
  console.log(req.body);
  db.query(
    `SELECT email, password, nickname FROM users where email = ? AND password = ?`,
    [req.body.email, req.body.password],
    (err, result) => {
      if (err) throw err;

      console.log(result.length);
      if (result.length === 1) {
        req.session.is_logined = true;
        req.session.nickname = result[0].nickname;
        res.redirect('/');
      } else {
        res.send('who?');
      }
    }
  );
});

router.get('/logout', (req, res) => {
  //
});

module.exports = router;
