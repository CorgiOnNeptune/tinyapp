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
  return undefined;
};

const getCurrentUserByCookie = (req, database = userDatabase) => {
  return database[req.session.userID];
};

const displayErrorMsg = (res, status, errMsg, returnLink) => {
  console.log(`Error ${status}: ${errMsg}`);
  return res.send(`<h3>Error ${status}</h3>
  <p>${errMsg}.<br/><br/>
  <b><a href="${returnLink}">Return</a></b></p>\n`);
};

const display404ErrorMsg = (res, returnLink) => {
  res.statusCode = 404;
  return displayErrorMsg(res, 404, 'Page not found', returnLink);
};

const display403ErrorMsg = (res, errMsg = 'Please login to proceed', returnLink = '/login') => {
  res.statusCode = 403;
  return displayErrorMsg(res, 403, errMsg, returnLink);
};

const urlsForUser = (userID, database = urlDatabase) => {
  let userURLS = {};

  for (const data in database) {
    if (database[data].userID === userID) {
      userURLS[data] = database[data];
    }
  }

  return userURLS;
};

const userOwnsURL = (userID, urlID, database = urlDatabase) => {
  const userURLs = urlsForUser(userID, database);

  if (!userURLs[urlID] || userURLs[urlID] === undefined) {
    return false;
  }
  return true;
};

const getTime = num => {
  const date = new Date();
  let timeSuffix = 'AM';

  if (num > 12) {
    num = num % 12;
    timeSuffix = 'PM';
  }

  return `${num}:${date.getMinutes()}:${date.getSeconds()} ${timeSuffix}`;
};

const getTimeStamp = () => {
  const date = new Date();
  const months = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep', 'Oct.', 'Nov.', 'Dec.'];
  const month = months[date.getMonth()];

  return `${month} ${date.getDate()}, ${date.getFullYear()} @ ${getTime(date.getHours())}`;
};

const trackVisit = () => {
  const timestamp = getTimeStamp();
  const visitorID = generateRandomString();

  return {timestamp, visitorID};
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  getCurrentUserByCookie,
  displayErrorMsg,
  display404ErrorMsg,
  display403ErrorMsg,
  urlsForUser,
  userOwnsURL,
  trackVisit
};
      