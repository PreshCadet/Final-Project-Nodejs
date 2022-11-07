import express from "express";
import { PrismaClient } from "@prisma/client";
import booksRouter from "./routes/book.js";

const app = express();
app.use(express.json()); // allows express to parse JSON from a network request

const prisma = new PrismaClient();

app.locals.prisma = prisma;

const PORT = 4000;

app.use(booksRouter);

app.get("/", (request, response) => {
  response.send({ message: "hello, world!" });
});

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
