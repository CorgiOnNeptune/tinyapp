const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { reset } = require('nodemon');
const {
  generateRandomString,
  getUserByEmail,
  getCurrentUserID,
  displayErrorMsg,
  display404ErrorMsg,
  display403ErrorMsg,
  urlsForUser,
  userHasURL
} = require('./helpers');
const { urlDatabase, userDatabase } = require('./data');

const app = express();
const PORT = 8080;

//
// Middleware
//
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//
// Routes
//

// Login/logout request routes
app.post('/login', (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const userExists = getUserByEmail(inputEmail);

  if (!userExists || !bcrypt.compareSync(inputPassword, userExists.password)) {
    display403ErrorMsg(res, 'Invalid login parameters');
  }

  res.cookie('user_id', userExists.id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserID(req)
  };

  if (!getCurrentUserID(req)) {
    return res.render('login', templateVars);
  }
  
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


// Registration requests
app.get('/register', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserID(req)
  };

  if (!getCurrentUserID(req)) {
    return res.render('register', templateVars);
  }
  
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password || getUserByEmail(email)) {
    const errMsg = getUserByEmail(email) ? `Email already in use` : `Email or password entry not valid`;
    res.statusCode = 400;

    return displayErrorMsg(res, res.statusCode, errMsg, '/register');
  }

  if (password !== req.body.confirmPassword) {
    return display403ErrorMsg(res, 'Passwords do not match', '/register');
  }
  
  // Add new user to userDatabase
  userDatabase[newID] = {
    id: newID,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  console.log(userDatabase);
  res.cookie('user_id', newID);
  res.redirect('/urls');
});


// Show logged in user list of their urls
app.get('/urls', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserID(req),
    urls: urlsForUser(req.cookies.user_id)
  };

  if (!getCurrentUserID(req)) {
    return res.redirect('/login');
  }

  res.render('urls_index', templateVars);
});


// Create new tiny URL
app.post('/urls', (req, res) => {
  const urlID = generateRandomString();

  if (!getCurrentUserID(req)) {
    return display403ErrorMsg(res);
  }

  // Add the new url to the urlDatabase
  urlDatabase[urlID] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };

  res.redirect(`/urls/${urlID}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserID(req),
  };

  if (!getCurrentUserID(req)) {
    return res.redirect('/login');
  }

  res.render('urls_new', templateVars);
});


// Take user to details page about their short URL
app.get('/urls/:id', (req, res) => {
  const reqID = req.params.id;
  const longURL = urlsForUser(req.cookies.user_id)[reqID];

  const templateVars = {
    currentUser: getCurrentUserID(req),
    id: reqID,
    longURL: longURL
  };

  if (!getCurrentUserID(req)) {
    return display403ErrorMsg(res);
  }

  if (!longURL || longURL === undefined) {
    return display404ErrorMsg(res, '/urls');
  }

  if (!userHasURL(req.cookies.user_id, reqID)) {
    return display403ErrorMsg(res, 'Unable to edit other users\' URLs', '/urls');
  }

  res.render('urls_show', templateVars);
});

// Manage POST requests for Edit button
app.post('/urls/:id', (req, res) => {
  const reqID = req.params.id;

  if (!getCurrentUserID(req)) {
    return display403ErrorMsg(res);
  }

  if (!userHasURL(req.cookies.user_id, reqID)) {
    return display403ErrorMsg(res, 'Unable to edit other users\' URLs', '/urls');
  }

  if (!urlDatabase[reqID]) {
    return display404ErrorMsg(res, '/urls');
  }

  urlDatabase[reqID].longURL = req.body.newLongURL;
  res.redirect(`/urls`);
});

// Manage POST requests for the Delete button
app.post('/urls/:id/delete', (req, res) => {
  if (!getCurrentUserID(req)) {
    return display403ErrorMsg(res);
  }

  if (!userHasURL(req.cookies.user_id, req.params.id)) {
    return display403ErrorMsg(res, 'Unable to delete other users\' URLs', '/urls');
  }

  if (!urlDatabase[req.params.id]) {
    return display404ErrorMsg(res, '/urls');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


// Take anybody to the longURL's page
app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return display404ErrorMsg(res, '/urls');
  }

  res.redirect(urlDatabase[req.params.id].longURL);
});

app.get('/', (req, res) => {
  if (!getCurrentUserID(req)) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});