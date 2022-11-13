import express from "express";
import pick from "lodash/pick.js";
import { body, validationResult } from "express-validator";

const booksRouter = express.Router();

/*
GET     /books
GET     /books/:bookId
GET     /books/:bookId/author
GET     /books/:bookId/genres

POST    /books
PUT     /books/:bookId
DELETE  /books/:bookId
*/

booksRouter.get("/books", async (request, response) => {
  const books = await request.app.locals.prisma.book.findMany();
  response.send({ data: books, message: "ok" });
});

booksRouter.get("/books/:bookId", async (request, response) => {
  const bookId = request.params.bookId;
  const book = await request.app.locals.prisma.book.findUnique({
    where: {
      id: Number.parseInt(bookId),
    },
  });

  response.send({ data: book, message: book ? "ok" : "not found" });
});

booksRouter.get("/books/:bookId/author", async (request, response) => {
  const bookId = request.params.bookId;
  const book = await request.app.locals.prisma.book.findUnique({
    where: {
      id: Number.parseInt(bookId),
    },
    include: {
      author: true,
    },
  });

  if (!book) {
    response.send({ data: null, message: "not found" });
    return;
  }

  response.send({ data: book.author, message: "ok" });
});

booksRouter.get("/books/:bookId/genres", async (request, response) => {
  const bookId = request.params.bookId;
  const book = await request.app.locals.prisma.book.findUnique({
    where: {
      id: Number.parseInt(bookId),
    },
    include: {
      genres: {
        include: {
          genre: true,
        },
      },
    },
  });
  const genres = book.genres.map(({ genre }) => genre);
  response.send({ data: genres, message: "ok" });
});

booksRouter.post(
  "/books",
  [
    body("title")
      .notEmpty()
      .isLength({ min: 5 })
      .withMessage(
        "Book requires `title` and should be minimum 5 characters long"
      ),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const filteredBody = pick(request.body, [
      "title",
      "subtitle",
      "published",
      "publisher",
      "pages",
      "description",
      "website",
      "authorId",
    ]);
    //for array of connected values
    /*if (filteredBody.genreIds) {
      const genresToAssociate = fileteredBody.genres.map(genreId => {
        return {
          genre: {
            create: {
              id: genreId,
            },
          },
        },
      });
      filteredBody.genres = {
        create: genresToAssociate,
      };
      delete fileteredBody.genreIds;
    }
    */
    if (request.body.genreIds) {
      const genres = request.body.genreIds.map((genreId) => ({
        genre: {
          connect: {
            id: Number.parseInt(genreId),
          },
        },
      }));
      filteredBody.genres = {
        create: genres,
      };
    }

    const book = await request.app.locals.prisma.book.create({
      data: filteredBody,
    });

    response.send({ data: book, message: "ok" });
  }
);

booksRouter.put("/books/:bookId", async (request, response) => {
  const bookId = request.params.bookId;

  const filteredBody = pick(request.body, [
    "title",
    "subtitle",
    "published",
    "publisher",
    "pages",
    "description",
    "website",
    "authorId",
  ]);

  const updatedBook = await request.app.locals.prisma.book.update({
    where: {
      id: Number.parseInt(bookId),
    },
    data: filteredBody,
  });

  response.send({ data: updatedBook, message: "ok" });
});

booksRouter.delete("/books/:bookId", async (request, response) => {
  const bookId = request.params.bookId;
  try {
    const deletedBook = await request.app.locals.prisma.book.delete({
      where: {
        id: Number.parseInt(bookId),
      },
    });
    response.send({
      data: deletedBook,
      message: deletedBook ? "ok" : "not found",
    });
  } catch {
    response.send({
      data: null,
      message: "resource not found",
    });
  }
});

export default booksRouter;
