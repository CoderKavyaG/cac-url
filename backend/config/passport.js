const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const apiUrl = (process.env.API_URL || '').replace(/\/$/, '');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${apiUrl}/auth/google/callback`,
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
            user.isVerified = true; // Google accounts are implicitly verified
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              picture: profile.photos[0]?.value || null,
              isVerified: true
            });
          }
        } else {
          // Update profile picture and name if changed
          if (profile.displayName) user.name = profile.displayName;
          if (profile.photos[0]?.value) user.picture = profile.photos[0].value;
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error('Passport Google Strategy Error:', error);
        return done(error, null);
      }
    }
  ));
  console.log('✓ Google OAuth Strategy initialized');
} else {
  console.warn('⚠️ Google OAuth keys missing. Authentication will fail.');
}

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
