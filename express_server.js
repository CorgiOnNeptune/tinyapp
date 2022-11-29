const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0213456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.random() * chars.length);
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/urls', (req, res) => {
  console.log('urlDatabase:\n', urlDatabase);
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});


// Create new tiny URL
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  
  // Add the new url to the urlDatabase
  urlDatabase[id] = longURL;
  
  res.redirect(`/urls/${id}`);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});


// Take user to details page about their short URL
app.get('/urls/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: longURL };

  if (longURL === undefined) {
    res.statusCode = 404;
    res.send('<b>Error 404 - Link not valid</b>');
    console.log('Invalid URL requested');
  }
  
  res.render('urls_show', templateVars);
});


// Take user to the longURL's page
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL === undefined) {
    res.statusCode = 404;
    res.send('<b>Error 404 - Link not valid</b>');
    console.log('Invalid URL requested');
  }
  
  res.redirect(longURL);
});


// Manage post requests for the Delete button
app.get('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});