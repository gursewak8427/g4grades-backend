export const getOtpTemplate = (otp: string) => {
  const privacyUrl = "https://g4grades.prismaple.com";
  const termsUrl = "https://g4grades.prismaple.com";

  return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>G4Grades OTP</title>
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
                        .otp {
                            display: inline-block;
                            font-size: 22px;
                            font-weight: bold;
                            color: #2e6c80;
                            background: #dbeafe; /* Light blue */
                            padding: 10px 20px;
                            border-radius: 5px;
                            margin-top: 15px;
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
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="logo">
                            G4<span>GRADES</span>
                        </div>
                        <h2>Your OTP Code</h2>
                        <p>Use the following OTP code to complete your verification:</p>
                        <div class="otp">${otp}</div>
                        <p>If you did not request this code, please ignore this email.</p>
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
