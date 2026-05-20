const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || '';
        const googleProfile = {
          googleId: profile.id,
          email,
          name: profile.displayName || '',
          picture: profile.photos?.[0]?.value || '',
        };

        if (!email) {
          return done(null, false, { isNew: true, profile: googleProfile });
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { alumniProfile: true },
        });

        if (user) {
          return done(null, user, { profile: googleProfile });
        }

        return done(null, false, { isNew: true, profile: googleProfile });
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
