// src/utils/sendEmail.ts
import nodemailer from 'nodemailer';
import {configDotenv} from "dotenv";

configDotenv()

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or other service/host/port
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        await transporter.sendMail(options);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// You can also create specific email functions if you have different types of emails
export const sendContactFormEmail = async (name: string, email: string, message: string): Promise<void> => {
    const mailOptions: EmailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER!}>`, // Shows the sender's name in the email client
        to: process.env.EMAIL_USER!,   // Send to yourself
        subject: `New Contact Form Message from ${name}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                  body {
                      margin: 0;
                      padding: 0;
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      background-color: #f4f7f6;
                  }
                  .container {
                      padding: 20px;
                      margin: 0 auto;
                      max-width: 600px;
                      background-color: #ffffff;
                      border-radius: 12px;
                      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
                  }
                  .header {
                      background-color: #007bff;
                      color: white;
                      padding: 20px;
                      text-align: center;
                      border-top-left-radius: 12px;
                      border-top-right-radius: 12px;
                  }
                  .header h1 {
                      margin: 0;
                      font-size: 24px;
                  }
                  .content {
                      padding: 30px 20px;
                  }
                  .content-block {
                      background-color: #f9f9f9;
                      border-left: 5px solid #007bff;
                      padding: 15px;
                      margin-bottom: 20px;
                  }
                  .content-block p {
                      margin: 0 0 5px 0;
                  }
                  .message-block {
                      padding: 20px;
                      background-color: #f9f9f9;
                      border-radius: 8px;
                      margin-top: 10px;
                  }
                  .footer {
                      text-align: center;
                      padding: 20px;
                      font-size: 12px;
                      color: #999999;
                  }
                  a {
                      color: #007bff;
                      text-decoration: none;
                  }
              </style>
          </head>
          <body>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f7f6; padding: 20px;">
                  <tr>
                      <td align="center">
                          <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 6px 20px rgba(0,0,0,0.05);">
                              <tr>
                                  <td class="header" style="background-color:#007bff; color:white; padding:20px; text-align:center; border-top-left-radius:12px; border-top-right-radius:12px;">
                                      <h1 style="margin:0; font-size:24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">New Inquiry Received</h1>
                                  </td>
                              </tr>
                              <tr>
                                  <td class="content" style="padding:30px 20px;">
                                      <div class="content-block" style="background-color:#f9f9f9; border-left:5px solid #007bff; padding:15px; margin-bottom:20px;">
                                          <p style="margin:0 0 5px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"><strong>From:</strong> ${name}</p>
                                          <p style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;"><strong>Email:</strong> <a href="mailto:${email}" style="color:#007bff; text-decoration:none;">${email}</a></p>
                                      </div>
                                      <h3 style="margin:0 0 10px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">Message:</h3>
                                      <div class="message-block" style="padding:20px; background-color:#f9f9f9; border-radius:8px; margin-top:10px;">
                                          <p style="margin:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">${message}</p>
                                      </div>
                                  </td>
                              </tr>
                              <tr>
                                  <td class="footer" style="text-align:center; padding:20px; font-size:12px; color:#999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                                      <p>This is an automated notification from your website.</p>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </body>
          </html>
        `,
    };
    await sendEmail(mailOptions);
};