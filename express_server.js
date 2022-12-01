const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { reset } = require('nodemon');
const {
  generateRandomString,
  getUserByEmail,
  getCurrentUserByCookie,
  displayErrorMsg,
  display404ErrorMsg,
  display403ErrorMsg,
  urlsForUser,
  userOwnsURL,
  trackVisit
} = require('./helpers');
const { urlDatabase, userDatabase } = require('./data');

const app = express();
const PORT = 8080;

//
// Middleware
//
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['secretKey', 'superSecretKey'],
}));


//
// Routes
//

// Login/logout request routes
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email);

  if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
    return display403ErrorMsg(res, 'Invalid login parameters');
  }

  req.session.userID = user.id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserByCookie(req)
  };

  if (!getCurrentUserByCookie(req)) {
    return res.render('login', templateVars);
  }
  
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


// Registration requests
app.get('/register', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserByCookie(req)
  };

  if (!getCurrentUserByCookie(req)) {
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
    password: bcrypt.hashSync(password)
  };

  req.session.userID = newID;
  res.redirect('/urls');
});


// Show logged in user list of their urls
app.get('/urls', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserByCookie(req),
    urls: urlsForUser(req.session.userID)
  };

  if (!getCurrentUserByCookie(req)) {
    return res.redirect('/login');
  }

  res.render('urls_index', templateVars);
});


// Create new tiny URL
app.put('/urls', (req, res) => {
  const urlID = generateRandomString();

  if (!getCurrentUserByCookie(req)) {
    return display403ErrorMsg(res);
  }

  // Add the new url to the urlDatabase
  urlDatabase[urlID] = {
    longURL: req.body.longURL,
    userID: req.session.userID,
    timesVisited: 0
  };

  res.redirect(`/urls/${urlID}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserByCookie(req),
  };

  if (!getCurrentUserByCookie(req)) {
    return res.redirect('/login');
  }

  res.render('urls_new', templateVars);
});


// Take user to details page about their short URL
app.get('/urls/:id', (req, res) => {
  const reqID = req.params.id;
  const urlData = urlDatabase[reqID];
  
  if (!getCurrentUserByCookie(req)) {
    return display403ErrorMsg(res);
  }

  if (!urlData || urlData === undefined) {
    return display404ErrorMsg(res, '/urls');
  }
  
  if (!userOwnsURL(req.session.userID, reqID)) {
    return display403ErrorMsg(res, 'Unable to edit other users\' URLs', '/urls');
  }
  
  const templateVars = {
    currentUser: getCurrentUserByCookie(req),
    id: reqID,
    urlData,
  };

  res.render('urls_show', templateVars);
});

// Manage POST requests for Edit button
app.put('/urls/:id', (req, res) => {
  const reqID = req.params.id;

  if (!getCurrentUserByCookie(req)) {
    return display403ErrorMsg(res);
  }

  if (!urlDatabase[reqID]) {
    return display404ErrorMsg(res, '/urls');
  }

  if (!userOwnsURL(req.session.userID, reqID)) {
    return display403ErrorMsg(res, 'Unable to edit other users\' URLs', '/urls');
  }

  urlDatabase[reqID].longURL = req.body.newLongURL;
  res.redirect(`/urls`);
});

// Manage POST requests for the Delete button
app.delete('/urls/:id/delete', (req, res) => {
  if (!getCurrentUserByCookie(req)) {
    return display403ErrorMsg(res);
  }
  
  if (!urlDatabase[req.params.id]) {
    return display404ErrorMsg(res, '/urls');
  }

  if (!userOwnsURL(req.session.userID, req.params.id)) {
    return display403ErrorMsg(res, 'Unable to delete other users\' URLs', '/urls');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


// Take anybody to the longURL's page
app.get('/u/:id', (req, res) => {
  const urlData = urlDatabase[req.params.id];

  if (!urlData) {
    return display404ErrorMsg(res, '/urls');
  }

  urlData.uniqueVisitors = (req.session.views || 0) + 1;
  urlData.timesVisited += 1;
  res.redirect(urlDatabase[req.params.id].longURL);
});

app.get('/', (req, res) => {
  if (!getCurrentUserByCookie(req)) {
    return res.redirect('/login');
  }

  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});