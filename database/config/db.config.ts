// // db/mongoose.ts

import mongoose from "mongoose";

const MONGO_DB: string = process.env.MONGO_DB?.toString() || "";

export const connectMongoDb = async () => {
  let connection = await mongoose.connect(MONGO_DB);
  console.log("DB Connected!");
  return connection;
};
