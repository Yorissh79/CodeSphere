// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel, { IUser } from '../models/userModel';
import { configDotenv } from "dotenv";

configDotenv();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.CALLBACK_URL) {
    throw new Error('Missing required Google OAuth environment variables');
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.CALLBACK_URL!,
        },
        async (
            accessToken: string,
            refreshToken: string,
            profile: any,
            done: (error: any, user?: any) => void
        ) => {
            try {
                // Validate profile data
                if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
                    return done(new Error('No email found in Google profile'), null);
                }

                const email = profile.emails[0].value;
                const googleId = profile.id;
                const name = profile.displayName ||
                    (profile.name?.givenName && profile.name?.familyName
                        ? `${profile.name.givenName} ${profile.name.familyName}`
                        : profile.name?.givenName) ||
                    'Unknown User';

                // Check if user exists by email or googleId
                let user = await userModel.findOne({
                    $or: [
                        { email: email },
                        { googleId: googleId }
                    ]
                }) as IUser | null;

                if (user) {
                    // If user found by email but no googleId, link the googleId
                    if (!user.googleId && googleId) {
                        user.googleId = googleId;
                        await user.save();
                    }
                    // If user found by googleId but email changed, update email
                    if (user.email !== email) {
                        user.email = email;
                        await user.save();
                    }
                } else {
                    // Create new user
                    user = await userModel.create({
                        name,
                        email,
                        googleId,
                        role: 'user', // Default role
                    }) as IUser;
                }

                return done(null, user);
            } catch (err) {
                console.error('Google Strategy Error:', err);
                return done(err, null);
            }
        }
    )
);

passport.serializeUser((user: any, done: (err: any, id?: string) => void) => {
    try {
        // Ensure user has an _id property
        if (!user || !user._id) {
            return done(new Error('User object is missing _id'), undefined);
        }
        done(null, user._id.toString());
    } catch (err) {
        console.error('Serialize User Error:', err);
        done(err, undefined);
    }
});

passport.deserializeUser(async (id: string, done: (err: any, user?: IUser | null) => void) => {
    try {
        // Validate the id parameter
        if (!id) {
            return done(new Error('No user ID provided'), null);
        }

        const user = await userModel.findById(id) as IUser | null;

        if (!user) {
            return done(null, null); // User not found, but not an error
        }

        done(null, user);
    } catch (err) {
        console.error('Deserialize User Error:', err);
        done(err, null);
    }
});

export default passport;