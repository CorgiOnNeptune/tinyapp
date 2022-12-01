const { userDatabase, urlDatabase } = require('./data');

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


module.exports = {
  generateRandomString,
  getUserByEmail,
  getCurrentUserID,
  displayErrorMsg,
  urlsForUser,
  userHasURL
};
      