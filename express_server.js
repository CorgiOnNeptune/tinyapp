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

const getCurrentUserID = (request, database = userDatabase) => {
  return database[request.cookies.user_id];
};

const displayError = (res, status, errMsg, returnLink) => {
  console.log(`Error ${status}: ${errMsg}`);
  return res.send(`<h3>Error ${status}</h3>
  <p>${errMsg}<br/><br/>
  <b><a href="${returnLink}">Try again</a></b></p>`);
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

// Login Routes
app.post('/login', (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  const userExists = getUserByEmail(inputEmail);

  if (!userExists || inputPassword !== userExists.password) {
    const errMsg = 'Invalid login parameters.';
    res.statusCode = 403;

    return displayError(res, res.statusCode, errMsg, '/login');
  }

  console.log(`User: ${req.body.email} has logged in.`);

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
  console.log(`User: ${req.cookies.user_id} has logged out.`);

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

    return displayError(res, res.statusCode, errMsg, '/register');
  }

  if (password !== req.body.confirmPassword) {
    const errMsg = 'Passwords do not match.';
    res.statusCode = 403;
    
    return displayError(res, res.statusCode, errMsg, '/register');
  }
  
  console.log(`User ${newID} has registered successfully.`);
  userDatabase[newID] = { id: newID, email, password };

  res.cookie('user_id', newID);
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUserID(req),
    urls: urlDatabase
  };

  if (!getCurrentUserID(req)) {
    return res.redirect('/login');
  }

  res.render('urls_index', templateVars);
});


// Create new tiny URL
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();

  if (!getCurrentUserID(req)) {
    const errMsg = 'Non-registered user unable to shorten URLs.';
    res.statusCode = 403;

    return res.send(`Error ${res.statusCode}\n${errMsg}\n`);
  }

  // Add the new url to the urlDatabase
  urlDatabase[id] = longURL;

  res.redirect(`/urls/${id}`);
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
  const longURL = urlDatabase[req.params.id];
  
  const templateVars = {
    currentUser: getCurrentUserID(req),
    id: req.params.id,
    longURL: longURL
  };

  if (longURL === undefined) {
    const errMsg = 'Invalid URL requested.';
    res.statusCode = 404;

    displayError(res, res.statusCode, errMsg, '/urls');
  }

  res.render('urls_show', templateVars);
});


// Take user to the longURL's page
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL === undefined) {
    const errMsg = 'Invalid URL requested.';
    res.statusCode = 404;

    displayError(res, res.statusCode, errMsg, '/urls');
  }

  res.redirect(longURL);
});

// Manage POST requests for Edit button
app.post('/urls/:id', (req, res) => {
  if (!getCurrentUserID(req)) {
    const errMsg = 'Non-registered user unable to edit URLs.';
    res.statusCode = 403;

    return res.send(`Error ${res.statusCode}\n${errMsg}\n`);
  }

  const newURL = req.body.newURL;
  urlDatabase[req.params.id] = newURL;

  res.redirect(`/urls`);
});


// Manage post requests for the Delete button
app.post('/urls/delete/:id', (req, res) => {
  if (!getCurrentUserID(req)) {
    const errMsg = 'Non-registered user unable to delete URLs.';
    res.statusCode = 403;

    return res.send(`Error ${res.statusCode}.\n${errMsg}\n`);
  }

  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});