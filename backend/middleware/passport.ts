import { Application } from 'express';
import session from 'express-session';
import passport from '../controllers/googleAuth';

export const configureMiddleware = (app: Application) => {
    app.use(
        session({
            secret: process.env.SESSION_SECRET || 'your-session-secret',
            resave: false,
            saveUninitialized: false,
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
};