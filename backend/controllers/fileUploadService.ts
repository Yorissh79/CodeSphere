// fileUploadService.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { configDotenv } from 'dotenv';

configDotenv();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
        folder: 'task-management',
        allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx', 'txt'],
        resource_type: 'auto',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    }),
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter,
});

export class FileUploadService {
    processTaskAttachments(files: Express.Multer.File[], textData: any[]) {
        const attachments: { type: string; content: string; filename?: string; originalName?: string }[] = [];

        // Process Cloudinary files
        if (files) {
            files.forEach((file) => {
                attachments.push({
                    type: file.mimetype.startsWith('image/') ? 'image' : 'file',
                    content: file.path, // Cloudinary URL
                    filename: file.filename,
                    originalName: file.originalname,
                });
            });
        }

        // Process text/link attachments
        if (textData) {
            textData.forEach((item) => {
                if (item.type === 'text' || item.type === 'link') {
                    attachments.push({
                        type: item.type,
                        content: item.content,
                    });
                }
            });
        }

        return attachments;
    }

    validateGithubUrl(url: string): boolean {
        const githubRegex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+/;
        return githubRegex.test(url);
    }
}

export const fileUploadService = new FileUploadService();