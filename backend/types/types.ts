export interface User {
    _id: string; // or mongoose.Types.ObjectId
    name?: string;
    surname?: string;
    email: string;
    role: string; // e.g., 'teacher', 'admin'
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: User; // Add user to Request type
    }
}