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
