require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 Testing email configuration...');
  console.log('Email:', process.env.EMAIL_USERNAME);
  console.log('Password:', process.env.EMAIL_PASSWORD ? '***' : 'undefined');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: true,
    logger: true
  });

  try {
    console.log('🔍 Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
    
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USERNAME}>`,
      to: process.env.EMAIL_USERNAME, // Send to yourself
      subject: 'Test Email',
      text: 'This is a test email from your Node.js app.',
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail(); 