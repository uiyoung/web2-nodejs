const express = require('express');
const template = require('../lib/template');
const router = express.Router();
const db = require('../lib/db');
const theme = require('../lib/theme');

router.get('/login', (req, res) => {
  const title = 'WEB - login';
  const form = `
  <form action='/auth/login' method='post'>
    <p><input type='email' name='email' placeholder='email'></p>
    <p><input type='password' name='password' placeholder='password'></p>
    <input type='submit' value='login'>
  </form>`;

  const html = template.HTML(title, '', '', `<h2>Login</h2>${form}`, theme.css(req.cookies.theme), '');
  res.send(html);
});

router.get('/signup', (req, res) => {
  const title = 'WEB - Sign Up';
  const form = `
  <form action='/auth/signup' method='post'>
    <p><input type='email' name='email' placeholder='email'></p>
    <p><input type='password' name='password' placeholder='password'></p>
    <p><input type='text' name='nickname' placeholder='nickname'></p>
    <!-- todo : confirm password --!>
    <input type='submit' value='sign up'>
  </form>`;

  const html = template.HTML(title, '', '', `<h2>Sign Up</h2>${form}`, theme.css(req.cookies.theme), '');
  res.send(html);
});

router.post('/login', (req, res) => {
  db.query(
    `SELECT email, password, nickname FROM users where email = ? AND password = ?`,
    [req.body.email, req.body.password],
    (err, result) => {
      if (err) next(err);

      if (result.length) {
        req.session.is_logined = true;
        req.session.nickname = result[0].nickname;
        req.session.save(() => {
          res.redirect('/');
        });
      } else {
        res.send('who?');
      }
    }
  );
});

router.post('/signup', (req, res) => {
  db.query(`SELECT * FROM users WHERE email = ?`, [req.body.email], (err, results) => {
    if (err) next(err);

    if (results.length) {
      res.json({ result: 'fail' });
    } else {
      db.query(
        `INSERT INTO users(email, password, nickname) VALUES (?, ?, ?)`,
        [req.body.email, req.body.password, req.body.nickname],
        (err, result) => {
          if (err) next(err);
          res.json({ result: 'ok' });
        }
      );
    }
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) next(err);
    res.redirect('/');
  });
});

module.exports = router;
