import express from "express";
import pick from "lodash/pick.js";
import { body, validationResult } from "express-validator";

const genreRouter = express.Router();

genreRouter.get("/genres", async (request, response) => {
    const genre = await request.app.locals.prisma.genre.findMany();
    response.send({ data: genre, message: "ok" });
  });


/*
HW:

GET     /genres
GET     /genres/:genreId
GET     /genres/:genreId/books
*/

genreRouter.get("/genres/:genreId", async (request, response) => {
    const genreId = request.params.genreId;
    const genre = await request.app.locals.prisma.genre.findUnique({
      where: {
        id: Number.parseInt(genreId),
      },
    });
  
    response.send({ data: genre, message: genre ? "ok" : "not found" });
  });

genreRouter.get("/genres/:genreId/books", async (request, response) => {
    const genreId = request.params.genreId;
    const genre = await request.app.locals.prisma.genre.findUnique({
      where: {
        id: Number.parseInt(genreId),
      },
      include: {
        books: {
            include: {
                book:true
            }
        },
      },
    });
  
    if (!genre) {
      response.send({ data: null, message: "not found" });
      return;
    }
    response.send({ data: genre.books, message:"ok" });
  });

//POST    /genres
genreRouter.post(
    "/genres",
    [
      body("title")
        .notEmpty()
        .withMessage(
          "title should not be empty"
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
      ]);
  
      const genre = await request.app.locals.prisma.genre.create({
        data: filteredBody,
      });

      response.send({newAuthor: genre, message: "Author added"})
    });

//PUT     /genres/:genreId
genreRouter.put("/genres/:genreId",  [
    body("title")
      .notEmpty()
      .withMessage(
        "title should not be empty"
      ),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    }

    const genreId = request.params.genreId;
  
    const filteredBody = pick(request.body, [
      "title",
    ]);

    const genre = await request.app.locals.prisma.genre.findUnique({
        where: {
          id: Number.parseInt(genreId),
        },
      });

    if (!genre) {
        response.send({ data: null, message: "not found" });
        return;} 
    else {
            const updatedGenre = await request.app.locals.prisma.genre.update({
                where: {
                  id: Number.parseInt(genreId),
                },
                data: filteredBody,
              });
              response.send({ data: updatedGenre, message: "ok" });
        }

   
  });
  

//DELETE  /genres/:genreId
genreRouter.delete("/genres/:genreId", async (request, response) => {
    const genreId = request.params.genreId;
    try {
      const deletedGenre = await request.app.locals.prisma.genre.delete({
        where: {
          id: Number.parseInt(genreId),
        },
      });
      response.send({
        data: deletedGenre,
        message: deletedGenre ? "ok" : "not found",
      });
    } catch {
      response.send({
        data: null,
        message: "resource not found",
      });
    }
  });

export default genreRouter;