const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email server connection error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Pixelary" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your verification code",
    html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        color: #202124;
      }
      .container {
        max-width: 520px;
        margin: 0 auto;
        padding: 32px 24px;
      }
      .logo {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #123AC0;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .text {
        font-size: 14px;
        line-height: 1.6;
        color: #5f6368;
      }
      .otp {
        margin: 24px 0;
        font-size: 28px;
        font-weight: 600;
        letter-spacing: 6px;
        color: #202124;
      }
      .divider {
        margin: 32px 0;
        border-top: 1px solid #e0e0e0;
      }
      .footer {
        font-size: 12px;
        color: #80868b;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">Pixelary</div>

      <div class="title">Verify your email address</div>

      <div class="text">
        Use the following verification code to continue:
      </div>

      <div class="otp">${otp}</div>

      <div class="text">
        This code will expire in 10 minutes.
      </div>

      <div class="divider"></div>

      <div class="footer">
        If you didn’t request this code, you can safely ignore this email.
      </div>
    </div>
  </body>
  </html>
  `,
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

const sendWelcomeEmail = async (email) => {
const mailOptions = {
  from: `"Pixelary" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Welcome to Pixelary",
  html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        color: #202124;
      }
      .container {
        max-width: 520px;
        margin: 0 auto;
        padding: 32px 24px;
      }
      .logo {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #123AC0;
      }
      .title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .text {
        font-size: 14px;
        line-height: 1.6;
        color: #5f6368;
      }
      .divider {
        margin: 32px 0;
        border-top: 1px solid #e0e0e0;
      }
      .footer {
        font-size: 12px;
        color: #80868b;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">Pixelary</div>

      <div class="title">Your email is verified</div>

      <div class="text">
        Welcome! Your email address has been successfully verified.
        You can now access all features of your account.
      </div>

      <div class="divider"></div>

      <div class="footer">
        If this wasn’t you, please secure your account immediately.
      </div>
    </div>
  </body>
  </html>
  `,
};


  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

module.exports = { sendOTPEmail, sendWelcomeEmail };
