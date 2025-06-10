import nodemailer from 'nodemailer';
import {configDotenv} from "dotenv";

configDotenv()

const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    service: 'gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SECRET_USER,
        pass: process.env.SECRET_PASSWORD,
    },
});

export default transporter;
