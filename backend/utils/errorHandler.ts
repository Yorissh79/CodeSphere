// src/utils/errorHandler.ts
import { Response } from 'express';
import env from '../config/env';

export const handleControllerError = (res: Response, error: any, message: string = "Internal server error") => {
    console.error(message, error);
    return res.status(500).json({
        error: message,
        // Only include detailed error message in development
        ...(env.NODE_ENV === 'development' && { details: error.message })
    });
};