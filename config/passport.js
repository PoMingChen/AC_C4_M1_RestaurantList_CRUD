const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

// Set up Passport authentication using LocalStrategy, with email as the username.
passport.use(new LocalStrategy(
  {
    usernameField: 'email'
  },
  (username, password, done) => {
    return User.findOne({
      attributes: ['id', 'name', 'email', 'password'],
      where: { email: username },
      raw: true
    })
      .then((user) => {
        // Do not directly compare plain text password with hashed password; first check if the user exists.
        if (!user) {
          return done(null, false, { message: '使用者 email 不存在' });
        }
        return bcrypt.compare(password, user.password) // Compare plain text password with hashed password.
          .then((isMatch) => {
            if (!isMatch) {
              return done(null, false, { message: 'email 或密碼錯誤' });
            }
            return done(null, user); // Authentication successful.
          });
      })
      .catch((error) => {
        error.errorMessage = '登入失敗';
        done(error); // Handle errors when querying the user.
      });
  }
));

// Set up Facebook authentication using FacebookStrategy.
passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['email', 'displayName'] // Specify which user fields to retrieve from Facebook.
  },
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value; // Retrieve the user's email from Facebook.
    const name = profile.displayName; // Retrieve the user's display name.

    return User.findOne({
      attributes: ['id', 'name', 'email'],
      where: { email },
      raw: true
    })
      .then((user) => {
        if (user) return done(null, user); // If the user exists, return the user object.

        const randomPwd = Math.random().toString(36).slice(-8); // Generate a random password.

        return bcrypt.hash(randomPwd, 10) // Hash the random password.
          .then((hash) => User.create({
            name,
            email,
            password: hash
          })) // If the user doesn't exist, create a new user.
          .then((user) => done(null, {
            id: user.id,
            name: user.name,
            email: user.email
          })); // Complete the authentication and return user data.
      })
      .catch((error) => {
        error.errorMessage = '登入失敗';
        done(error); // Handle errors during Facebook authentication.
      });
  }
));

// Serialize user information into the session, typically storing user ID and basic info.
passport.serializeUser((user, done) => {
  const { id, name, email } = user; // Extract necessary user information.
  return done(null, {
    id,
    name,
    email
  }); // Store minimal user information in the session.
});

// Deserialize user data from the session back into a user object.
passport.deserializeUser((user, done) => {
  done(null, {
    id: user.id
  }); // Return the user ID to fetch user details if needed.
});

module.exports = passport; // Export the configured passport instance.
