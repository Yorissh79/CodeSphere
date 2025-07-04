import { Request, Response } from 'express';
import Content, { IContent } from '../models/Content';
import FAQ, { IFAQ } from '../models/FAQ';
import ContactMessage, { IContactMessage } from '../models/ContactMessage';

export class ContentController {
    // Get content by page type
    getContentByType = async (req: Request, res: Response): Promise<any> => {
        try {
            const { pageType } = req.params;
            const content = await Content.findOne({ pageType, isActive: true });

            if (!content) {
                return res.status(404).json({ message: 'Content not found' });
            }

            res.json(content);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Update content
    updateContent = async (req: Request, res: Response) => {
        try {
            const { pageType } = req.params;
            const { title, content, isActive } = req.body;

            const updatedContent = await Content.findOneAndUpdate(
                { pageType },
                { title, content, isActive },
                { new: true, upsert: true }
            );

            res.json(updatedContent);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Get all content for admin
    getAllContent = async (req: Request, res: Response) => {
        try {
            const content = await Content.find().sort({ pageType: 1 });
            res.json(content);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // FAQ Management
    getFAQs = async (req: Request, res: Response) => {
        try {
            const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 });
            res.json(faqs);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    createFAQ = async (req: Request, res: Response) => {
        try {
            const { question, shortAnswer, detailedAnswer, order } = req.body;

            const faq = new FAQ({
                question,
                shortAnswer,
                detailedAnswer,
                order: order || 0
            });

            await faq.save();
            res.status(201).json(faq);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    updateFAQ = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const { question, shortAnswer, detailedAnswer, order, isActive } = req.body;

            const faq = await FAQ.findByIdAndUpdate(
                id,
                { question, shortAnswer, detailedAnswer, order, isActive },
                { new: true }
            );

            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }

            res.json(faq);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    deleteFAQ = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const faq = await FAQ.findByIdAndDelete(id);

            if (!faq) {
                return res.status(404).json({ message: 'FAQ not found' });
            }

            res.json({ message: 'FAQ deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Contact Messages
    getContactMessages = async (req: Request, res: Response) => {
        try {
            const { status } = req.query;
            const filter = status ? { status } : {};

            const messages = await ContactMessage.find(filter)
                .sort({ createdAt: -1 });

            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    createContactMessage = async (req: Request, res: Response) => {
        try {
            const { name, email, message } = req.body;

            const contactMessage = new ContactMessage({
                name,
                email,
                message
            });

            await contactMessage.save();
            res.status(201).json({ message: 'Message sent successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    updateContactMessage = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const { status, reply } = req.body;

            const message = await ContactMessage.findByIdAndUpdate(
                id,
                { status, reply },
                { new: true }
            );

            if (!message) {
                return res.status(404).json({ message: 'Message not found' });
            }

            res.json(message);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    deleteContactMessage = async (req: Request, res: Response): Promise<any> => {
        try {
            const { id } = req.params;
            const message = await ContactMessage.findByIdAndDelete(id);

            if (!message) {
                return res.status(404).json({ message: 'Message not found' });
            }

            res.json({ message: 'Message deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }
}