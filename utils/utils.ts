import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Set your secret key in env

export const isFloat = (n: any) => {
  return Number(n) === n && n % 1 !== 0;
};

// Generate JWT Token
export const generateToken = (user: any) => {
  return jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: any) => {
  return jwt.verify(token, SECRET_KEY);
};

export const decodeToken = (token: any) => {
  return jwt.decode(token);
};

export const showPastDate = (dateString: any) => {
  const date: any = new Date(dateString);
  const now: any = new Date();

  const seconds = Math.floor((now - date) / 1000); // Positive for past dates
  const daysDifference = Math.floor(seconds / 86400); // Convert to days

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  if (daysDifference === 0) {
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const count = Math.floor(seconds / secondsInUnit);
      if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }

  if (daysDifference === 1) return "yesterday";
  if (daysDifference < -6)
    return `last ${date.toLocaleDateString("en-US", { weekday: "long" })}`;

  return `${daysDifference} days ago`;
};
