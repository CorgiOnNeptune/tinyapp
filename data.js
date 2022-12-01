const bcrypt = require('bcryptjs');

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
  'aJ481W': {
    id: 'aJ481W',
    email: 'user3@example.com',
    password: bcrypt.hashSync('1234', 10),
  },
  'qTSPlk': {
    id: 'qTSPlk',
    email: 'diamonds@example.com',
    password: bcrypt.hashSync('123456', 10),
  }
};

module.exports = {
  urlDatabase,
  userDatabase
};