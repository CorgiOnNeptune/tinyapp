// @ts-nocheck
const { assert } = require('chai');

const { getUserByEmail, urlsForUser, userOwnsURL } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLs = {
  'b2xVn2': {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: 'user2RandomID'
  },
};

describe('#getUserByEmail()', () => {
  it('should return a user with a valid email', () => {
    const actual = getUserByEmail('user@example.com', testUsers);

    assert.deepEqual(actual, testUsers.userRandomID);
  });

  it('should return undefined if given an invalid email', () => {
    const actual = getUserByEmail('blah@blah.ca', testUsers);

    assert.isUndefined(actual);
  });

  it('should properly access properties of valid user', () => {
    const actual = getUserByEmail('user2@example.com', testUsers);

    assert.strictEqual(actual.password, 'dishwasher-funk');
  });
});

describe('#urlsForUser()', () => {
  it('should return object of URLs belonging to user', () => {
    const actual = urlsForUser('userRandomID', testURLs);
    const expected = {'b2xVn2': 'http://www.lighthouselabs.ca'};
      
    assert.deepEqual(actual, expected);
  });

  it('should return empty object if user doesn\'t have any URLs', () => {
    const actual = urlsForUser('shoop', testURLs);

    assert.deepEqual(actual, {});
  });
});
  
describe('#userOwnsURL()', () => {
  it('should return true if user owns URL', () => {
    const actual = userOwnsURL('user2RandomID', '9sm5xK', testURLs);

    assert.isTrue(actual);
  });

  it('should return false if user doesn\'t URL', () => {
    const actual = userOwnsURL('user2RandomID', 'b2xVn2', testURLs);

    assert.isFalse(actual);
  });

  it('should return false if user doesn\'t exist', () => {
    const actual = userOwnsURL('user3RandomID', 'b2xVn2', testURLs);

    assert.isFalse(actual);
  });
  
  it('should return false if URL ID doesn\'t exist', () => {
    const actual = userOwnsURL('userRandomID', 'ja8kd2', testURLs);

    assert.isFalse(actual);
  });
});