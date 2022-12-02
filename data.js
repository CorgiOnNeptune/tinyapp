const bcrypt = require('bcryptjs');

const urlDatabase = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'aJ481W',
    dateCreated: 'Nov. 4, 2000 @ 12:00:00 AM',
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: 'aJ481W',
    dateCreated: 'Jan. 6, 2020 @ 06:5:57 AM',
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
  'wQz2yQ': {
    longURL: "http://www.diamondsonneptune.com",
    userID: 'qTSPlk',
    dateCreated: 'Aug. 30, 1997 @ 12:30:00 PM',
    timesVisited: 0,
    uniqueVisitors: 0,
    visits: [],
  },
};

const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur"),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk"),
  },
  'aJ481W': {
    id: 'aJ481W',
    email: 'user3@example.com',
    password: bcrypt.hashSync('1234'),
  },
  'qTSPlk': {
    id: 'qTSPlk',
    email: 'diamonds@example.com',
    password: bcrypt.hashSync('123456'),
  }
};

module.exports = {
  urlDatabase,
  userDatabase
};