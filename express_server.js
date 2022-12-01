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

const getUserByEmail = (email, database = userDatabase) => {
  for (const data in database) {
    if (database[data].email === email) {
      return database[data];
    }
  }
  return null;
};

const getCurrentUserID = (req, database = userDatabase) => {
  return database[req.cookies.user_id];
};

const displayErrorMsg = (res, status, errMsg, returnLink) => {
  console.log(`Error ${status}: ${errMsg}`);
  return res.send(`<h3>Error ${status}</h3>
  <p>${errMsg}<br/><br/>
  <b><a href="${returnLink}">Try again</a></b></p>`);
};

const urlsForUser = (userID, database = urlDatabase) => {
  let userURLS = {};

  for (const data in database) {
    if (database[data].userID === userID) {
      userURLS[data] = database[data].longURL;
    }
  }

  return userURLS;
};

const userHasURL = (userID, urlID) => {
  const userURLs = urlsForUser(userID);

  if (!userURLs[urlID] || userURLs[urlID] === undefined) {
    return false;
  }
  return true;
};

//
// Data
//

const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'aJ481W'
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: 'aJ481W'
  },
  'wQz2yQ': {
    longURL: "http://www.diamondsonneptune.com",
    userID: 'qTSPlk'
  },
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
  'aJ481W': {
    id: 'aJ481W',
    email: 'user3@example.com',
    password: '1234',
  },
  'qTSPlk': {
    id: 'qTSPlk',
    email: 'diamonds@example.com',
    password: '1234',
  }
};

//
// Routes
//

// Login/logout request routes
app.post('/login', (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const userExists = getUserByEmail(inputEmail);

  if (!userExists || inputPassword !== userExists.password) {
    const errMsg = 'Invalid login parameters.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/login');
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
    let errMsg = getUserByEmail(email) ? `Email already in use.` : `Email or password entry not valid.`;
    res.statusCode = 400;

    return displayErrorMsg(res, res.statusCode, errMsg, '/register');
  }

  if (password !== req.body.confirmPassword) {
    const errMsg = 'Passwords do not match.';
    res.statusCode = 403;
    
    return displayErrorMsg(res, res.statusCode, errMsg, '/register');
  }
  
  // Add new user to userDatabase
  userDatabase[newID] = { id: newID, email, password };

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
  const longURL = req.body.longURL;
  const urlID = generateRandomString();

  if (!getCurrentUserID(req)) {
    const errMsg = 'Non-registered user unable to shorten URLs.';
    res.statusCode = 403;

    return res.send(`Error ${res.statusCode}\n${errMsg}\n`);
  }

  // Add the new url to the urlDatabase
  urlDatabase[urlID] = { longURL, userID: req.cookies.user_id };

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
    const errMsg = 'Non-registered user unable to edit URLs.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/login');
  }

  if (!userHasURL(req.cookies.user_id, reqID)) {
    const errMsg = 'Unable to view other users\' URLs.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  if (longURL === undefined) {
    const errMsg = 'Page not found.';
    res.statusCode = 404;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  res.render('urls_show', templateVars);
});

// Manage POST requests for Edit button
app.post('/urls/:id', (req, res) => {
  const reqID = req.params.id;

  if (!getCurrentUserID(req)) {
    const errMsg = 'Non-registered user unable to edit URLs.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/login');
  }

  if (!userHasURL(req.cookies.user_id, reqID)) {
    const errMsg = 'Unable to edit other users\' URLs.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  if (!urlDatabase[reqID]) {
    const errMsg = 'Page not found.';
    res.statusCode = 404;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  urlDatabase[reqID].longURL = req.body.newLongURL;
  res.redirect(`/urls`);
});

// Manage POST requests for the Delete button
app.post('/urls/delete/:id', (req, res) => {
  if (!getCurrentUserID(req)) {
    const errMsg = 'Non-registered user unable to delete URLs.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/login');
  }

  if (!userHasURL(req.cookies.user_id, req.params.id)) {
    const errMsg = 'Unable to delete other users\' URLs.';
    res.statusCode = 403;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  if (!urlDatabase[req.params.id]) {
    const errMsg = 'Page not found.';
    res.statusCode = 404;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


// Take anybody to the longURL's page
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (longURL === undefined) {
    const errMsg = 'Page not found.';
    res.statusCode = 404;

    return displayErrorMsg(res, res.statusCode, errMsg, '/urls');
  }

  res.redirect(longURL);
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