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

const getUserByEmail = (database, email) => {
  for (const data in database) {
    if (database[data].email === email) {
      return database[data];
    }
  }
  return null;
};

const getCurrentUser = request => {
  return userDatabase[request.cookies.user_id];
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

app.get('/login', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUser(req),
  };

  res.render('login', templateVars);
});

// Registration requests
app.get('/register', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUser(req),
  };

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const newID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password || getUserByEmail(userDatabase, email)) {
    let errMsg = getUserByEmail(userDatabase, email) ? `Email already in use.` : `Email or password entry not valid.`;
    console.log(`Registration failed. ${errMsg}`);

    res.statusCode = 400;
    return res.send(`<b>Error ${res.statusCode} - ${errMsg}</b><br/>
    <a href="/register">Try again</a>`);
  }

  if (password !== req.body.confirmPassword) {
    const errMsg = 'Passwords do not match.';
    console.log(`Registration failed. ${errMsg}`);

    res.statusCode = 403;
    return res.send(`<b>Error ${res.statusCode} - ${errMsg}</b><br/>
    <a href="/register">Try again</a>`);

  }
  console.log(`User ${newID} has registered successfully.`);
  userDatabase[newID] = { id: newID, email, password };

  res.cookie('user_id', newID);
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  const templateVars = {
    currentUser: getCurrentUser(req),
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
  const templateVars = {
    currentUser: getCurrentUser(req),
  };

  res.render('urls_new', templateVars);
});


// Take user to details page about their short URL
app.get('/urls/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  
  const templateVars = {
    currentUser: getCurrentUser(req),
    id: req.params.id,
    longURL: longURL
  };

  if (longURL === undefined) {
    res.statusCode = 404;
    res.send(`<b>Error ${res.statusCode} - Link not valid</b>`);
    console.log('Invalid URL requested');
  }

  res.render('urls_show', templateVars);
});


// Take user to the longURL's page
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (longURL === undefined) {
    res.statusCode = 404;
    res.send(`<b>Error ${res.statusCode} - Link not valid</b>`);
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