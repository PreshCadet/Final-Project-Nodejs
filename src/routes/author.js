import express from "express";
import pick from "lodash/pick.js";
import { body, validationResult } from "express-validator";

const authorRouter = express.Router();

authorRouter.get("/authors", async (request, response) => {
    const author = await request.app.locals.prisma.author.findMany();
    response.send({ data: author, message: "ok" });
  });

/*
HW:

GET     /authors
GET     /authors/:authorId
GET     /authors/:authorId/books
*/

authorRouter.get("/authors/:authorId", async (request, response) => {
    const authorId = request.params.authorId;
    const author = await request.app.locals.prisma.author.findUnique({
      where: {
        id: Number.parseInt(authorId),
      },
    });
  
    response.send({ data: author, message: author ? "ok" : "not found" });
  });


authorRouter.get("/authors/:authorId/books", async (request, response) => {
    const authorId = request.params.authorId;
    const author = await request.app.locals.prisma.author.findUnique({
      where: {
        id: Number.parseInt(authorId),
      },
      include: {
        books: {
            include: {
                author: true
            }
        },
      },
    });
  
    if (!author) {
      response.send({ data: null, message: "not found" });
      return;
    }
  
    response.send({ data: author.books, message: "ok" });
  });



//POST    /authors

authorRouter.post(
    "/authors",
    [
      body("firstName")
        .notEmpty()
        .withMessage(
          "Do not leave firtName empty"
        ),
        body("lastName")
        .notEmpty()
        .withMessage(
          "Do not leave lastName empty"
        ),
    ],
    async (request, response) => {
      const errors = validationResult(request);
      if (!errors.isEmpty()) {
        response.status(400).json({ errors: errors.array() });
        return;
      }
  
      const filteredBody = pick(request.body, [
        "firstName",
        "lastName",
      ]);
      
      const author = await request.app.locals.prisma.author.create({
        data: filteredBody,
      });

      response.send({newAuthor: author, message: "Author added"})
    });


//PUT     /authors/:authorId
authorRouter.put("/authors/:authorId", async (request, response) => {

    const authorId = request.params.authorId;
  
    const filteredBody = pick(request.body, [
        "firstName",
        "lastName",
      ]);

    const author = await request.app.locals.prisma.author.findUnique({
        where: {
          id: Number.parseInt(authorId),
        },
      });

    if (!author) {
        response.send({ data: null, message: "not found" });
        return;} 
    else {
            const updatedAuthor = await request.app.locals.prisma.author.update({
                where: {
                  id: Number.parseInt(authorId),
                },
                data: filteredBody,
              });
              response.send({ data: updatedAuthor, message: "ok" });
        }
  });

//DELETE  /authors/:authorId
authorRouter.delete("/authors/:authorId", async (request, response) => {
    const authorId = request.params.authorId;
    try {
      const deletedAuthor = await request.app.locals.prisma.author.delete({
        where: {
          id: Number.parseInt(authorId),
        },
      });
      response.send({
        data: deletedAuthor,
        message: deletedAuthor ? "ok" : "not found",
      });
    } catch {
      response.send({
        data: null,
        message: "resource not found",
      });
    }
  });
  

export default authorRouter;