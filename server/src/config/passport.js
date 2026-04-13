import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

// Only register the Google strategy if credentials are configured
// This prevents a server crash when .env variables aren't set yet
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value
          const googleId = profile.id
          const photo = profile.photos?.[0]?.value
          const fullName = profile.displayName

          // Check if user already exists by googleId
          let user = await User.findOne({ googleId })
          if (user) return done(null, user)

          // Link to existing account by email
          if (email) {
            user = await User.findOne({ email })
            if (user) {
              user.googleId = googleId
              user.authProvider = 'google'
              if (!user.avatar?.url && photo) {
                user.avatar = { url: photo, publicId: '' }
              }
              await user.save()
              return done(null, user)
            }
          }

          // Create new buyer account
          user = await User.create({
            fullName,
            email,
            googleId,
            authProvider: 'google',
            userType: 'buyer',
            isVerified: true,
            avatar: photo ? { url: photo, publicId: '' } : undefined,
          })

          return done(null, user)
        } catch (error) {
          console.error('❌ Google Strategy Error:', error)
          return done(error, null)
        }
      }
    )
  )
  console.log('✅ Google OAuth strategy registered')
} else {
  console.warn('⚠️  Google OAuth not configured — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env to enable it')
}

export default passport
