export const getWorkStatusUpdateTemplate = (
  workItemTitle: string,
  status: string
) => {
  return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Work Status Update | G4Grades</title>
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
                    .status-box {
                        background: #e0f2fe; /* Light blue */
                        color: #0369a1; /* Dark blue */
                        padding: 10px 15px;
                        border-radius: 5px;
                        font-size: 18px;
                        font-weight: bold;
                        margin-top: 15px;
                        display: inline-block;
                    }
                    .footer {
                        font-size: 12px;
                        color: #777;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Work Status Update</h2>
                    <p>The status of your work "<strong>${workItemTitle}</strong>" has been updated.</p>
                    <div class="status-box">${status}</div>
                    <p>Check your account for more details.</p>
                    <hr>
                    <p class="footer">
                        G4Grades | <a href="https://g4grades.prismaple.com">Visit Website</a>
                    </p>
                </div>
            </body>
            </html>
          `;
};
