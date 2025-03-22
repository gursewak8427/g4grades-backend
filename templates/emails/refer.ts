export const getCouponReceivedTemplate = (newUserEmail: string) => {
  const privacyUrl = "https://g4grades.prismaple.in";
  const termsUrl = "https://g4grades.prismaple.in";
  const websiteUrl = "https://g4grades.prismaple.in"; // Direct link for more details

  return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Referral Notification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 450px;
                        background: white;
                        margin: 30px auto;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }
                    .logo {
                        font-size: 28px;
                        font-weight: bold;
                    }
                    .logo span {
                        color: #6b21a8; /* Purple */
                    }
                    .footer {
                        font-size: 12px;
                        color: #777;
                        margin-top: 20px;
                    }
                    .footer a {
                        color: #2e6c80;
                        text-decoration: none;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 15px;
                        background-color: #6b21a8;
                        color: white !important;
                        text-decoration: none;
                        font-weight: bold;
                        border-radius: 5px;
                        margin-top: 15px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        G4<span>GRADES</span>
                    </div>
                    <h2>New User Registered</h2>
                    <p>The user <strong>${newUserEmail}</strong> has signed up using your referral code.</p>
                    <p>Visit your account for more details.</p>
                    <a href="${websiteUrl}" class="button">Check Details</a>
                    <hr>
                    <p class="footer">
                        G4Grades | 
                        <a href="${privacyUrl}">Privacy Policy</a> | 
                        <a href="${termsUrl}">Terms of Service</a>
                    </p>
                </div>
            </body>
            </html>
          `;
};
