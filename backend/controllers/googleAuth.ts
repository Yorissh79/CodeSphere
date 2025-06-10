import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userModel, {IUser} from "../models/userModel";
import {configDotenv} from "dotenv";

configDotenv()

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
            callbackURL: 'http://localhost:3001/auth/google/callback',
        },
        async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
            try {
                let user = await userModel.findOne({ email: profile.emails[0].value }) as IUser | null;
                if (!user) {
                    user = await userModel.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        role: 'user',
                    }) as IUser;
                }
                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);

passport.serializeUser((user: any, done: (err: any, id?: string) => void) => {
    done(null, user._id.toString());
});

passport.deserializeUser(async (id: string, done: (err: any, user?: IUser | null) => void) => {
    try {
        const user = await userModel.findById(id) as IUser | null;
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;