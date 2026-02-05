const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.API_URL}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ where: { googleId: profile.id } });
      
      if (!user) {
        // Check if email exists (user signed up differently before)
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.name = profile.displayName;
          user.picture = profile.photos[0]?.value || null;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            picture: profile.photos[0]?.value || null,
          });
        }
      } else {
        // Update profile picture and name if changed
        user.name = profile.displayName;
        user.picture = profile.photos[0]?.value || null;
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
