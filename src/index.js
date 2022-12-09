import express from "express";
import { PrismaClient } from "@prisma/client";
// import booksRouter from "./routes/book.js";
// import genreRouter from "./routes/genre.js";
// import authorRouter from "./routes/author.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import requiresAuth from "./middleware/requiresAuth.js";
import profileRouter from "./routes/profile.js";
import tweetRouter from "./routes/tweet.js";
import userRouter from "./routes/user.js";
import unAuth from "./routes/unAuthenticated.js";

dotenv.config();
// console.log(process.env) to make prisma read other env vars

const app = express();
app.use(express.json()); // allows express to parse JSON from a network request
app.use(cookieParser()); // allows express to read/create cookies

const prisma = new PrismaClient();

app.locals.prisma = prisma;

const PORT = 4000;

// app.use(booksRouter);
// app.use(genreRouter);
// app.use(authorRouter);
app.use(profileRouter);
app.use(unAuth);
app.use(userRouter);
app.use(tweetRouter);
app.use(authRouter);
app.use(cookieParser);
app.use(requiresAuth);


app.get("/", (request, response) => {
  response.send({ message: "Final-Project-Sorita" });
});

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
