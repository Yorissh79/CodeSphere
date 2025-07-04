import {sendEmail} from '../utils/emailServices'; // Adjust path if necessary

interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
    const mailOptions: EmailOptions = {
        from: `"CodeSphere Verification" <${process.env.EMAIL_USER!}>`,
        to: email,
        subject: 'Your OTP Code for CodeSphere',
        html: `
            <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
                <h2>Welcome to CodeSphere!</h2>
                <p>Please use the following One-Time Password (OTP) to verify your account. This OTP is valid for 10 minutes.</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #007bff;">${otp}</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `,
    };
    await sendEmail(mailOptions);
};