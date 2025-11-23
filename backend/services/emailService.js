const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Your OTP for URL Shortener",
            html: `
                <h2>Email Verification</h2>
                <p>Your One-Time Password (OTP) is:</p>
                <h1 style="color: #007bff; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">© 2024 URL Shortener. All rights reserved.</p>
            `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Email sent:", result.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

module.exports = { sendOtpEmail };
