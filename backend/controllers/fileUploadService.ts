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
    // This function will now process both Multer files (from `req.files`)
    // and attachments (potentially including base64) sent in the request body (from `req.body.attachments`).
    processTaskAttachments(
        multerFiles: Express.Multer.File[] | undefined,
        bodyAttachments: { type: 'text' | 'link' | 'image' | 'file'; content: string; filename?: string; originalName?: string }[] | undefined
    ): { type: 'text' | 'link' | 'image' | 'file'; content: string; filename?: string; originalName?: string }[] {
        const attachments: { type: 'text' | 'link' | 'image' | 'file'; content: string; filename?: string; originalName?: string }[] = [];

        // Process Cloudinary files (from Multer upload)
        if (multerFiles && multerFiles.length > 0) {
            multerFiles.forEach((file) => {
                attachments.push({
                    type: file.mimetype.startsWith('image/') ? 'image' : 'file',
                    content: file.path, // Cloudinary URL
                    filename: file.filename,
                    originalName: file.originalname,
                });
            });
        }

        // Process attachments sent in the request body (which might include base64 or existing Cloudinary URLs)
        if (bodyAttachments && bodyAttachments.length > 0) {
            bodyAttachments.forEach((item) => {
                // Ensure item.type is one of the expected literal types
                if (item.type === 'text' || item.type === 'link' || item.type === 'image' || item.type === 'file') {
                    // Check if this item is a base64 string that needs to be uploaded to Cloudinary
                    // This is a simplified check. A more robust solution might involve checking for a specific prefix
                    // like 'data:image/' or a flag from the frontend.
                    // For now, if the content is not a URL (e.g., http, https) assume it's base64 or plain text/link.
                    if (item.type === 'image' && item.content.startsWith('data:')) {
                        // In a real application, you'd upload this base64 image to Cloudinary here
                        // and replace item.content with the Cloudinary URL.
                        // For this exercise, we'll assume the frontend will handle existing Cloudinary URLs
                        // and newly uploaded files from Multer will have URLs.
                        // If the frontend is sending base64, we will simply store it as content.
                        // However, Cloudinary `upload.array` is for actual file uploads.
                        // If you want to upload base64 from the body to Cloudinary, you'd need Cloudinary's upload API
                        // directly within the controller, not through multer.
                        // For this scope, we'll just pass the base64 content if it's there.
                        attachments.push({
                            type: 'image',
                            content: item.content, // Storing base64 directly
                            filename: item.filename,
                            originalName: item.originalName,
                        });
                    } else {
                        // Assume it's a URL from existing attachments or plain text/link
                        attachments.push({
                            type: item.type,
                            content: item.content,
                            filename: item.filename,
                            originalName: item.originalName,
                        });
                    }
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
