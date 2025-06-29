// src/config/env.ts
import { configDotenv } from 'dotenv';

// Load environment variables from .env file
configDotenv();

interface EnvConfig {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    CALLBACK_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_ISSUER: string;
    JWT_AUDIENCE: string;
    CLIENT_URL: string;
    SERVER_URL: string;
    MONGODB_URI: string;
    NODE_ENV: string;
    SESSION_SECRET: string;
}

const env: EnvConfig = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    CALLBACK_URL: process.env.CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    JWT_ISSUER: process.env.JWT_ISSUER || 'your-app-name',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'your-app-users',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    SERVER_URL: process.env.SERVER_URL || 'http://localhost:3001',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database',
    NODE_ENV: process.env.NODE_ENV || 'development',
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
};

// Validate required environment variables
const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'CALLBACK_URL',
    'JWT_SECRET',
    'MONGODB_URI',
    'SESSION_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !env[varName as keyof EnvConfig]);

if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

export default env;
