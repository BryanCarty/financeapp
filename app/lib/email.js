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
        <head>
        <!-- Link to Courier Prime font from Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Courier Prime', Courier, monospace; /* Fallback to Courier if Courier Prime isn't available */              
            }
            h1 {
                font-family: 'Courier Prime', Courier, monospace;
                color: #353535;
                display: inline-block; 
                border-bottom: 2px dashed #353535;
            }
            p {
                font-family: 'Courier Prime', Courier, monospace;
                color: #353535;
            }
            .copyright-section {
              display: inline-block; 
              border-top: 2px dashed #353535;
              padding-top: 10px; /* Optional: Adds some space between the border and the text */
            }
        </style>
    </head>
    <body>
        <div >
            <div>
                <h1>Reset Password Email 🔒</h1>
            </div>
            <br><br>
            <div>
                <p>Hey ${name} 😊,</p>
                <p>We received a request to reset your password. If this was not you, please reply to this email. If this was you, and you do in fact wish to reset your password, click the below link.</p>
                <br>
                <br>
                <p>You can reset your password here: <a href="${resetLink}">Reset Password</a></p>
                <br>
                <br>
                <p>Happy Trading,</p>
                <p>Bryan</p>
            </div>
            <br>
            <br>
            <br>
            <div class="copyright-section">
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

export async function sendWelcomeEmail(email, name) {
  try {
    const htmlToSend = `
    <html>
        <head>
        <!-- Link to Courier Prime font from Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Courier Prime', Courier, monospace; /* Fallback to Courier if Courier Prime isn't available */              
            }
            h1 {
                font-family: 'Courier Prime', Courier, monospace;
                color: #353535;
                display: inline-block; 
                border-bottom: 2px dashed #353535;
            }
            p {
                font-family: 'Courier Prime', Courier, monospace;
                color: #353535;
            }                
            a {
                font-family: 'Courier Prime', Courier, monospace;
                color: #353535;
                text-decoration: underline;
                border: none; 
                background: none;  
                padding: 0;  
              }
               .copyright-section {
              display: inline-block; 
              border-top: 2px dashed #353535;
              padding-top: 10px; /* Optional: Adds some space between the border and the text */
            }
        </style>
    </head>
    <body>
        <div >
            <div>
                <h1>Welcome Email 🤝</h1>
            </div>
            <br><br>
            <div>
                <p>Hey ${name} 😊,</p>
                <p>This email is just to welcome you to The traders Journal. Please don't hesitate to reach out to us if you have any questions.</p>
                <br>
                <br>
                <br>
                <p>Happy Trading,</p>
                <p>Bryan</p>
            </div>
            <br>
            <br>
            <br>
            <div class="copyright-section">
                <p>&copy; 2024 The Traders Journal. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;

    try {
      const info = await transporter.sendMail({
        from: `"The Traders Journal" <${process.env.THE_TRADERS_JOURNAL_EMAIL}>`,
        to: email,
        subject: "Welcome Email",
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

export async function sendNewPostEmail(
  followerEmailsAndNames,
  authorUsername,
  postId
) {
  try {
    // Loop through each follower to send them an email
    for (let follower of followerEmailsAndNames) {
      const { email, username } = follower;

      const htmlToSend = `
        <html>
            <head>
            <!-- Link to Courier Prime font from Google Fonts -->
            <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">
            <style>
                body {
                    font-family: 'Courier Prime', Courier, monospace; /* Fallback to Courier if Courier Prime isn't available */              
                }
                h1 {
                    font-family: 'Courier Prime', Courier, monospace;
                    color: #353535;
                    display: inline-block; 
                    border-bottom: 2px dashed #353535;
                }
                p {
                    font-family: 'Courier Prime', Courier, monospace;
                    color: #353535;
                }
                a {
                    font-family: 'Courier Prime', Courier, monospace;
                    color: #353535;
                    text-decoration: underline;
                    border: none; 
                    background: none;  
                    padding: 0;  
                  }
                     .copyright-section {
              display: inline-block; 
              border-top: 2px dashed #353535;
              padding-top: 10px; /* Optional: Adds some space between the border and the text */
            }
            </style>
        </head>
        <body>
            <div>
                <div>
                    <h1>${authorUsername} made a new post! 🚀</h1>
                </div>
                <br><br>
                <div>
                    <p>Hey ${username} 😊,</p>
                    <p>This email is just to let you know that a user you follow, ${authorUsername} made a new post.</p>
                    <br>
                    <br>
                    <p>You can see ${authorUsername}'s new post here: <a href="http://localhost:3000/articles/${postId}">View Post</a></p>
                    <br>
                    <br>
                    <p>Happy Trading,</p>
                    <p>Bryan</p>
                </div>
                <br>
                <br>
                <br>
                <div class="copyright-section">
                    <p>&copy; 2024 The Traders Journal. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`;

      try {
        const info = await transporter.sendMail({
          from: `"The Traders Journal" <${process.env.THE_TRADERS_JOURNAL_EMAIL}>`,
          to: email,
          subject: `New Post by ${authorUsername}`,
          html: htmlToSend,
        });

        console.log(`Email sent to ${email}:`, info.response);
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
      }
    }

    return { success: true, message: "Emails sent successfully" };
  } catch (error) {
    console.error(
      `An error occurred in the sendNewPostEmail function: ${error}`
    );
    return { success: false, message: "Failed to send emails", error };
  }
}
