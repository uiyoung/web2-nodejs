module.exports = {
  HTML: (title, list, buttons, body) => {
    return `<!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <p><a href='/'>topics</a> <a href='/author'>authors</a></p> 
        ${list}
        ${buttons}
        ${body}
      </body>
      </html>`;
  },
  list: (topics) => {
    let list = '<ul>';
    topics.forEach((topic) => {
      list += `<li><a href="./?id=${topic.id}">${topic.title}</a></li>`;
    });
    list += '</ul>';

    return list;
  },
  authorSelect: (authors, selectedID = 0) => {
    let select = '<select name="author_id">';
    select += '<option value="" disabled selected hidden>select author</option>';
    authors.forEach((author) => {
      select += `<option value=${author.id} ${author.id === selectedID ? 'selected' : ''}>${author.name}</option>`;
    });
    select += '</select>';

    return select;
  },
  authorTable: (authors) => {
    let table = '<table>';
    authors.forEach((author, index) => {
      table += `<tr>
        <td>${index + 1}</td>
        <td>${author.name}</td>
        <td>${author.profile}</td>
        <td><a href='/author/update?id=${author.id}'>update</a></td>
        <td>
          <form action='/author/delete' method='post'>
            <input type='hidden' name='id' value='${author.id}'>
            <input type='submit' value='delete'>
          </form>
        </td>
      </tr>`;
    });
    table += '</table>';
    table += `<style>
      table, td, th{
        border: 1px solid black;
        border-collapse: collapse;
      }
    </style>`;
    return table;
  },
};
