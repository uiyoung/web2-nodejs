module.exports = {
  StatusUI: (req, res) => {
    return req.user
      ? `hello, ${req.user.nickname} <a href='/auth/logout'>logout</a>`
      : `<a href='/auth/signup'>sign up</a> <a href='/auth/login'>login</a>`;
  },
};
