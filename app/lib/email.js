import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.THE_TRADERS_JOURNAL_EMAIL,
    pass: process.env.THE_TRADERS_JOURNAL_EMAIL_PASSWORD,
  },
});

export async function sendResetPasswordEmail(email, name, resetLink) {
  try {
    const htmlToSend = `
    <html>
    <body>
        <div>
            <div>
                <h1>Reset Password Email ✅</h1>
            </div>
            <br><br>
            <div>
                <p>Hey ${name} 😊,</p>
                <p>This email is just to let you know that......</p>
                <br>
                <br>
                <p>You can reset your password at the following link: ${resetLink}</p>
            </div>
            <br>
            <br>
            <br>
            <br>
            <div>
                <p>&copy; 2024 The Traders Journal. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;

    try {
      const info = await transporter.sendMail({
        from: `"The Traders Journal" <${process.env.THE_TRADERS_JOURNAL_EMAIL}>`,
        to: email,
        subject: "Reset Password Email",
        html: htmlToSend,
      });

      console.log("Email sent successfully:", info.response);
      return { success: true, message: "Email sent successfully", info };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, message: "Failed to send email", error };
    }
  } catch (error) {
    console.log(
      `An error occurred in the sendResetPasswordEmail util function: ${error}`
    );
    return { success: false, message: "Failed to send email", error };
  }
}
