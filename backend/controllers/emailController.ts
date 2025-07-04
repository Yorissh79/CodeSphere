import { Request, Response } from 'express';
import { sendContactFormEmail } from '../utils/emailServices';

// Define an interface for the expected shape of your request body
interface ContactFormRequestBody {
    name: string;
    email: string;
    message: string;
}

// Adjust the Request type to include your custom body interface
export const emailSender = async (req: Request<any, any, ContactFormRequestBody>, res: Response): Promise<any> => {
    // req.body is now strongly typed
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        await sendContactFormEmail(name, email, message);
        console.log('Contact form email successfully processed!');
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error handling contact form:', error);
        res.status(500).json({ message: 'Failed to send message.', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};