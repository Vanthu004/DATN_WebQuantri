// Test cấu hình email
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmailConfig = async () => {
  console.log('🔧 Testing email configuration...\n');
  
  // Kiểm tra biến môi trường
  console.log('📋 Environment variables:');
  console.log(`   EMAIL_USERNAME: ${process.env.EMAIL_USERNAME ? '✅ Set' : '❌ Not set'}`);
  console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  
  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error('\n❌ Missing email configuration in .env file');
    console.log('Please add:');
    console.log('EMAIL_USERNAME=your-email@gmail.com');
    console.log('EMAIL_PASSWORD=your-16-character-app-password');
    return;
  }
  
  console.log('\n📧 Testing email connection...');
  
  try {
    // Tạo transporter
    const transporter = nodemailer.createTransporter({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Test kết nối
    console.log('🔗 Testing connection...');
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Test gửi email
    console.log('\n📤 Testing email sending...');
    const testEmail = process.env.EMAIL_USERNAME; // Gửi cho chính mình
    
    const mailOptions = {
      from: `"Swear Server Test" <${process.env.EMAIL_USERNAME}>`,
      to: testEmail,
      subject: "Test Email - Swear Server",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email Configuration</h2>
          <p>Xin chào,</p>
          <p>Email này được gửi để test cấu hình email của Swear Server.</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #28a745; margin: 0;">✅ Cấu hình email thành công!</h3>
          </div>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          <p>Nếu bạn nhận được email này, có nghĩa là cấu hình email đã hoạt động bình thường.</p>
          <p>Trân trọng,<br>Swear Server</p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Sent to: ${testEmail}`);
    
    console.log('\n🎉 Email configuration is working perfectly!');
    console.log('You can now use email features in your application.');
    
  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error(`   Error: ${error.message}`);
    
    // Xử lý các lỗi cụ thể
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication Error - Please check:');
      console.error('   1. EMAIL_USERNAME is correct');
      console.error('   2. EMAIL_PASSWORD is App Password (not regular password)');
      console.error('   3. 2FA is enabled on your Gmail account');
      console.error('   4. App Password is generated correctly');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection Error - Please check:');
      console.error('   1. Internet connection');
      console.error('   2. Firewall settings');
      console.error('   3. Gmail server status');
    } else if (error.code === 'EENVELOPE') {
      console.error('\n📧 Envelope Error - Please check:');
      console.error('   1. Email address format');
      console.error('   2. From/To email addresses');
    } else {
      console.error('\n📧 Other Error - Please check:');
      console.error('   1. Nodemailer version');
      console.error('   2. Node.js version');
      console.error('   3. Network configuration');
    }
    
    console.log('\n📖 For detailed instructions, see EMAIL_SETUP_GUIDE.md');
  }
};

// Chạy test
testEmailConfig().catch(console.error); 