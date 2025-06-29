import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, message) => {
  try {
    // Validate inputs
    if (!email || !subject || !message) {
      throw new Error('Missing required email parameters.');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for others
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject,
      html: message,
    });

    console.log(`Email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; // optional: rethrow for global error handler
  }
};

export default sendEmail;
