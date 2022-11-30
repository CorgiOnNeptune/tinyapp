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

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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
  console.log(`User: ${req.cookies.user_id} has logged out.`);

  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const currentUser = userDatabase[req.cookies.user_id];
  const templateVars = {
    currentUser,
  };
  
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  if (password === req.body.confirmPassword) {
    console.log(`User ${newID} has registered.`);

    userDatabase[newID] = { id: newID, email, password };
    
    res.cookie('user_id', newID);
    res.redirect('/urls');
  } else {
    console.log(`Registration failed.`);

    res.redirect('/register');
  }
});


app.get('/urls', (req, res) => {
  const currentUser = userDatabase[req.cookies.user_id];

  const templateVars = {
    currentUser,
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
  const currentUser = userDatabase[req.cookies.user_id];

  const templateVars = { currentUser };
  res.render('urls_new', templateVars);
});


// Take user to details page about their short URL
app.get('/urls/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const currentUser = userDatabase[req.cookies.user_id];

  const templateVars = {
    currentUser,
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