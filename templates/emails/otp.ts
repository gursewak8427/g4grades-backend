export const getOtpTemplate = (otp: string) => {
  const companyName = "G4Grades by Prismaple";
  const companyLogoUrl = "https://g4grades-api.prismaple.in/uploads/logo.jpg";
  const privacyUrl = "https://g4grades.prismaple.com";
  const termsUrl = "https://g4grades.prismaple.com";

  return `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <div style="text-align: center;">
                                <img src="${companyLogoUrl}" alt="${companyName} Logo" style="max-width: 150px; margin-bottom: 20px;">
                        </div>
                        <h2>Your OTP Code</h2>
                        <p>Use the following OTP code to complete your verification:</p>
                        <h3 style="color: #2e6c80;">${otp}</h3>
                        <p>If you did not request this code, please ignore this email.</p>
                        <hr>
                        <p style="font-size: 12px; color: #888;">
                                ${companyName} | 
                                <a href="${privacyUrl}" style="color: #2e6c80;">Privacy Policy</a> | 
                                <a href="${termsUrl}" style="color: #2e6c80;">Terms of Service</a>
                        </p>
                </div>
        `;
};
