export const getNewMessageTemplate = (
  workTitle: string,
  messageContent: string,
  fileCount: number = 0
) => {
  const messageText =
    messageContent || `${fileCount} ${fileCount > 1 ? "files" : "file"}`;

  return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Message in ${workTitle} | G4Grades</title>
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
                    .message-box {
                        background: #e0f2fe; /* Light blue */
                        color: #0369a1; /* Dark blue */
                        padding: 10px 15px;
                        border-radius: 5px;
                        font-size: 16px;
                        font-weight: bold;
                        margin-top: 15px;
                        display: inline-block;
                        word-wrap: break-word;
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
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>New Message Received</h2>
                    <p>You have an unread message in "<strong>${workTitle}</strong>".</p>
                    <a href="https://g4grades.prismaple.in/works" class="button">View Message</a>
                    <hr>
                    <p class="footer">
                        G4Grades | <a href="https://g4grades.prismaple.in">Visit Website</a>
                    </p>
                </div>
            </body>
            </html>
          `;
};
