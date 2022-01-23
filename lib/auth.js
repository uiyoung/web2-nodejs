module.exports = {
  StatusUI: (req, res) => {
    return req.session.is_logined
      ? `hello, ${req.session.nickname} <a href='/auth/logout'>logout</a>`
      : `<a href='/auth/signup'>sign up</a> <a href='/auth/login'>login</a>`;
  },
};
