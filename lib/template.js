const template = {
  HTML: (title, list, buttons, body) => {
    return `<!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${buttons}
        ${body}
      </body>
      </html>`;
  },
  list: (files) => {
    list = '<ul>';
    files.forEach((file) => {
      list += `<li><a href="./?id=${file}">${file}</a></li>`;
    });
    list += '</ul>';

    return list;
  },
};

module.exports = template;
