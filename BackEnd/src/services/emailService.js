const nodemailer = require('nodemailer');

console.log('SMTP Config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    from: process.env.EMAIL_FROM
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendEmail(to, token, link, type = 'verify') {
    let subject, html;

    if (type === 'verify') {
        subject = 'Xác thực tài khoản của bạn';
        html = `
            <p>Chào bạn,</p>
            <p>Vui lòng nhấn vào liên kết dưới đây để xác thực tài khoản:</p>
            <a href="${link}">${link}</a>
            <p>Nếu bạn không đăng ký tài khoản, hãy bỏ qua email này.</p>
        `;
    } else if (type === 'reset') {
        subject = 'Đặt lại mật khẩu';
        html = `
            <p>Chào bạn,</p>
            <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để tạo mật khẩu mới:</p>
            <a href="${link}">${link}</a>
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
        `;
    } else {
        subject = 'Thông báo từ hệ thống';
        html = '<p>Đây là email thông báo từ hệ thống.</p>';
    }

    // Cấu hình transporter (bạn cần thay đổi theo SMTP của bạn)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html
    });
}

module.exports = { sendEmail }; 