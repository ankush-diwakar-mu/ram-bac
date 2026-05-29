import dotenv from "dotenv";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import User from "../models/user.model.js"; // adjust path if needed

// Load environment variables
dotenv.config();

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const generateUsers = async () => {
  try {
    // Optional: delete old users
    await User.deleteMany({});
    console.log("Old users deleted");

    const users = [];

    for (let i = 0; i < 120; i++) {
      users.push({
        username: faker.internet.username().toLowerCase() + i,
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password({
          length: 10,
        }),
      });
    }

    await User.insertMany(users);

    console.log("120 fake users inserted");

    mongoose.connection.close();
  } catch (error) {
    console.log(error);
    mongoose.connection.close();
  }
};

generateUsers();