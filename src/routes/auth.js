import express, { response } from "express"
import pick from "lodash/pick.js"
import bcrypt from "bcrypt"
import omit from "lodash/omit.js"
import { body, validationResult } from "express-validator"
import jwt from "jsonwebtoken"
const authRouter = express.Router()

const SALT_ROUNDS = 10



// ========== POST /sign-up ========== 
authRouter.post(
    "/sign-up",
[
    body('firstName')
    .notEmpty()
    .withMessage("Firstname must not be empty"),
    body('lastName')
    .notEmpty()
    .withMessage("Lastname must not be empty"),
    body('password')
        .notEmpty()
        .isLength({min: 5}) // title length restriction
        .withMessage("Password requires atleast 5 characters"),
    body('email')
        .notEmpty()
        .isEmail()
        .withMessage("Kindly entered a valid email"),
    body('username')
        .notEmpty()
        .withMessage("Username needs not to be empty"),
    body('birthday')
        .notEmpty()
        .toDate()
        .withMessage("Birthday must be valid"),
    body('bio')
        .notEmpty()
        .withMessage("Bio must not be empty"),
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
        "password",
        "email",
        "username",
        "birthday",
        "bio",
    ]);

    var dob = new Date(filteredBody.birthday);  
    //calculate month difference from current date in time  
    var month_diff = Date.now() - dob.getTime();  
    //convert the calculated difference in date format  
    var age_dt = new Date(month_diff);   
    //extract year from date      
    var year = age_dt.getUTCFullYear();  
    //now calculate the age of the user  
    var age = Math.abs(year - 1970);  

    if (age < 18) {
        response.status(401).json({data:null, message: "Unauthorized Access! must be 18 years old and above to sign-up"});
        return;
    }

    const hashedPassword = await bcrypt.hash(filteredBody.password, SALT_ROUNDS);
    filteredBody.password = hashedPassword;
    
    try {
        const user = await request.app.locals.prisma.user.create({
            data: filteredBody,
        });
    
        const filteredUser = omit(user, ["id", "password"])
    
        const jwtSessionObject = {
            uid: user.id,
            email: user.email
        }
    
        const maxAge = 1 * 24 * 60 *60
        const jwtSession = await jwt.sign(jwtSessionObject, process.env.JWT_SECRET, {
            expiresIn: maxAge
        });
       
        console.log("jwtSession", jwtSession)
    
        response.cookie("sessionId", jwtSession, {
            httpOnly: true,
            maxAge: maxAge * 1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production" ? true : false,
        });
    
        response.send({ data:filteredUser, message: "ok"})
    } catch (error) {
        response.send({ data:null, message: "Error upon sign-up, check if user is already registered"})   
    }
    

})

// // ========== POST /sign-in ========== 
authRouter.post(
    "/sign-in",
[
    body('password')
        .notEmpty()
        .isLength({min: 5}) // title length restriction
        .withMessage("Sign in requires atleast 5 characters"),
    body('email')
        .isEmail()
        .optional({ checkFalsy: true })
        .withMessage("sign in must be a valid email"),
    body('username')
        .optional({ checkFalsy: true }),
], 
async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      response.status(400).json({ errors: errors.array() });
      return;
    };

    const filteredBody = pick(request.body, ["email", "password", "username"]);

    let user; 
    try {
        if (filteredBody.email) {
            user = await request.app.locals.prisma.user.findUnique({
                where: { email: filteredBody.email}
            })
        
        } else {
            user = await request.app.locals.prisma.user.findUnique({
                where: { username: filteredBody.username}
            });
            }
    } catch (error) {
        response.status(404).json({ data:null, message: "error username/email required"});
    }
  

    if (!user) {
        response.status(404).send({ data:null, message: "error user not found"});
        return;
    }

    const isCorrectPassword = await bcrypt.compare(
        filteredBody.password,
        user.password
    );


    if(!isCorrectPassword) {
        response.send({data: null, message: "incorrect password"});
    }

    const jwtSessionToken = {
        uid: user.id,
        email: user.email
    };

    const maxAge = 1 * 24 * 60 * 60;

    const jwtSession = await jwt.sign(
        jwtSessionToken,
        process.env.JWT_SECRET,
        {
            expiresIn: maxAge
        }
    );

    response.cookie(
        "sessionId",
        jwtSession,
        {
            httpOnly: true,
            maxAge: maxAge * 1000,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production" ? true : false
        }
    );
    
    const filteredUser = omit(user, ["id","password"]);

    response.send({data: filteredUser, message: "signed-in"});
});




// ========== POST /sign-out ========== 
authRouter.post("/sign-out", (request, response) => {
    const cookies = request.cookies
    const jwtSession = cookies.sessionId
    response.cookie("sessionId", jwtSession, {maxAge: 1})
    response.send({ data: null, message:"ok, you're signed out" })
})

export default authRouter;