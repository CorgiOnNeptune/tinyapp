const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

//
// Middleware
//

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0213456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.random() * chars.length);
  }
  return result;
};


//
// Data
//

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//
// Routes
//

app.post('/login', (req, res) => {
  console.log(`User: ${req.body.username} has logged in.`);
  
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  console.log(`User: ${req.cookies.username} has logged out.`);

  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  // console.log('urlDatabase:\n', urlDatabase);
  const templateVars = {
    username: req.cookies.username,
    urls: urlDatabase
  };
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
  const templateVars = { username: req.cookies['username'] };
  res.render('urls_new', templateVars);
});


// Take user to details page about their short URL
app.get('/urls/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const templateVars = {
    username: req.cookies['username'],
    id: req.params.id,
    longURL: longURL
  };

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

// Manage POST requests for Edit button
app.post('/urls/:id', (req, res) => {
  console.log('Edit has been submitted');

  const newURL = req.body.newURL;
  urlDatabase[req.params.id] = newURL;

  res.redirect(`/urls`);
});


// Manage post requests for the Delete button
app.post('/urls/delete/:id', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});