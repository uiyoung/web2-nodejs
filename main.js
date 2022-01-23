const express = require('express');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const db = require('./lib/db');
const dev = require('./config/dev');

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secure: true,
    HttpOnly: true,
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: new MySQLStore(dev.dbOptions),
    resave: false,
    saveUninitialized: false,
  })
);
app.use(compression());

const indexRouter = require('./routes/index');
const topicRouter = require('./routes/topic');
const authorRouter = require('./routes/author');
const themeRouter = require('./routes/theme');
const authRouter = require('./routes/auth');

app.get('*', (req, res, next) => {
  console.log(req.session);
  db.query(`select id, title from topic`, (err, topics) => {
    if (err) {
      next(err);
    }

    req.list = topics;
    next();
  });
});

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/author', authorRouter);
app.use('/theme', themeRouter);
app.use('/auth', authRouter);

app.use((req, res) => {
  res.status(404).send('Sorry cant find that!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('server on port 3000');
});
