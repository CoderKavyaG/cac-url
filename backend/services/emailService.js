// Email service removed - using simple password authentication instead
// No external email service required

const sendOtpEmail = async (email, otp) => {
    // This function is deprecated - OTP-based authentication removed
    // Simple password-based authentication is used instead
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return true;
};

module.exports = { sendOtpEmail };
