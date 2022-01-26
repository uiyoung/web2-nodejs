const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local');
const template = require('../lib/template');
const db = require('../lib/db');
const theme = require('../lib/theme');
const router = express.Router();

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, done) => {
      db.query(`SELECT * FROM users WHERE email= ?`, [email], async (err, user) => {
        if (err) {
          return done(err);
        }

        if (user.length === 0) {
          return done(null, false, { message: 'Incorrect username' });
        }

        const result = await bcrypt.compare(password, user[0].password);
        if (!result) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user[0], { message: 'Welcome' });
      });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log('serializeUser', user);

  done(null, user.email);
});

passport.deserializeUser((id, done) => {
  console.log('deserializeuser', id);

  db.query(`SELECT * FROM users WHERE email = ?`, [id], (err, row) => {
    if (err) throw err;

    done(null, row[0]);
  });
});

router.get('/login', (req, res) => {
  const flash = req.flash();
  const flashMessage = flash.error ? flash.error[0] : '';
  const title = 'WEB - login';
  const form = `
  <form action='/auth/login' method='post'>
    <p><input type='email' name='email' placeholder='email'></p>
    <p><input type='password' name='password' placeholder='password'></p>
    <input type='submit' value='login'>
  </form>
  ${flashMessage}
  `;

  const html = template.HTML(title, '', '', `<h2>Login</h2>${form}`, theme.css(req.cookies.theme), '');
  res.send(html);
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: true,
  })
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

router.get('/signup', (req, res) => {
  const flash = req.flash();
  const flashMessage = flash.error ? flash.error[0] : '';
  const title = 'WEB - Sign Up';
  const form = `
  <form action='/auth/signup' method='post'>
    <p>
      <input type='email' name='email' placeholder='email' required>
      ${flashMessage}
    </p>
    <p><input type='password' name='password' placeholder='password' required></p>
    <p><input type='text' name='nickname' placeholder='nickname' required></p>
    <!-- todo : confirm password --!>
    <input type='submit' value='sign up'>
  </form>`;

  const html = template.HTML(title, '', '', `<h2>Sign Up</h2>${form}`, theme.css(req.cookies.theme), '');
  res.send(html);
});

router.post('/signup', (req, res, next) => {
  const { email, password, nickname } = req.body;

  db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, result) => {
    if (err) next(err);

    if (result.length) {
      req.flash('error', 'email already exists.');
      res.redirect('/auth/signup');
    } else {
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);

      db.query(
        `INSERT INTO users(email, password, nickname) VALUES (?, ?, ?)`,
        [email, hash, nickname],
        (err, result) => {
          if (err) next(err);

          const user = { email: email };

          req.login(user, (err) => {
            if (err) {
              return next(err);
            }

            res.redirect('/');
          });
        }
      );
    }
  });
});

module.exports = router;
