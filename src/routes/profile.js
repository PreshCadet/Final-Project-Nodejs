import requiresAuth from "../middleware/requiresAuth.js"
import express from "express"
import pick from "lodash/pick.js"
import bcrypt from "bcrypt"
import omit from "lodash/omit.js"
import { body, validationResult } from "express-validator"
import jwt from "jsonwebtoken"

const profileRouter = express.Router()

const SALT_ROUNDS = 10



// GET /me
profileRouter.get("/me", requiresAuth, async (request, response) => {

    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
    console.log(jwtSession)

    const jwtSessionObject = await jwt.verify(
        jwtSession,
        process.env.JWT_SECRET
    );
    const userId = jwtSessionObject.uid;

    const user = await request.app.locals.prisma.user.findUnique({
        where: {
            id: userId
        },
    });

    const filteredUser = omit(user, [
        "id",
        "password"
    ]);

    response.send({
        data: filteredUser,
        message: "ok"
    });
});

//PUT /password
profileRouter.put("/profile/password", 
[
    body('password')
    .notEmpty()
    .withMessage("enter previous password"),
    body('newpassword')
    .notEmpty()
    .isLength({min: 5}) // title length restriction
    .withMessage("new password must be atleast 5 characters"),
]
,requiresAuth, async (request,response) => {

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    };
        
    const filteredBody = pick(request.body, ["newpassword","password"]);

    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
    console.log(jwtSession)
       
    const jwtSessionObject = await jwt.verify(
            jwtSession,
            process.env.JWT_SECRET
        );
    const userId = jwtSessionObject.uid;

        // get user details using user id
    const user = await request.app.locals.prisma.user.findUnique({
            where: {
                       id: userId
            }
           });

    const isCorrectPassword = await bcrypt.compare(
            filteredBody.password,
            user.password
        );
    
    if (!isCorrectPassword) {
        response.status(401).send({ data:null, message: "error: current password does not match"});
        return;
    };
        
    const hashedPassword = await bcrypt.hash(filteredBody.newpassword, SALT_ROUNDS);
    filteredBody.password = hashedPassword;

    const updatedpassword = await request.app.locals.prisma.user.update({
        where: {
            id: userId
        },
        data: {
        password: filteredBody.password,
        }
      });
    
      const filteredUser = omit(updatedpassword, [
        "id",
        "password"
    ]);

      response.send({ data: filteredUser, message: "password updated" });    

    });

//PUT /newusername
profileRouter.put("/profile/newusername",
    [
    body('username')
    .notEmpty()
    .withMessage("enter new username"),
    ] ,requiresAuth, async(request, response) => {

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    };

    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
    console.log(jwtSession)
       
    const jwtSessionObject = await jwt.verify(
            jwtSession,
            process.env.JWT_SECRET
        );
    const userId = jwtSessionObject.uid;

    const username = pick(request.body, ["username"]);

    try {
    const updatedusername = await request.app.locals.prisma.user.update({
        where: {
            id: userId
        },
        data: username,
      });
    
      const filteredUser = omit(updatedusername, [
        "id",
        "password"
    ]);

      response.send({ data: filteredUser, message: "username updated" });    
    } catch (error) {
        response.send({ data:null, message: "Error upon renewing username, check if username is already taken"})   
    }
});

//PUT /newbio
profileRouter.put("/profile/newbio",
    [
    body('bio')
    .notEmpty()
    .withMessage("enter new bio"),
    ] ,requiresAuth, async(request, response) => {

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    };

    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
    console.log(jwtSession)
       
    const jwtSessionObject = await jwt.verify(
            jwtSession,
            process.env.JWT_SECRET
        );
    const userId = jwtSessionObject.uid;

    const bio = pick(request.body, ["bio"]);

    try {
    const updatedusername = await request.app.locals.prisma.user.update({
        where: {
            id: userId
        },
        data: bio,
      });
    
      const filteredUser = omit(updatedusername, [
        "id",
        "password"
    ]);

      response.send({ data: filteredUser, message: "bio updated" });    
    } catch (error) {
        response.send({ data:null, message: "Error upon renewing bio ", error})   
    }
});

//PUT /birthday
profileRouter.put("/profile/newbirthday",
    [
    body('birthday')
    .notEmpty()
    .withMessage("Birthday cannnot be empty"),
    ] ,requiresAuth, async(request, response) => {

    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    } else {
      response.status(401).json({ error: "Error user cannot change their birthday." });
      return;
    }

    
});


export default profileRouter;