// src/validation/authValidation.ts
import { z } from 'zod';

// For regular user registration
export const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters").optional(), // Optional for Google users
    googleId: z.string().optional(), // Optional, used if registering a user directly with a Google ID
    role: z.enum(['user', 'admin']).default('user'),
    surname: z.string().max(100).optional(),
    group: z.string().max(50).optional(),
});

// For ID token verification (client-side Google Sign-In)
export const googleTokenSchema = z.object({
    idToken: z.string().min(1, "ID token is required"),
});
