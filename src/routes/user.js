import requiresAuth from "../middleware/requiresAuth.js"
import express from "express"
import pick from "lodash/pick.js"
import omit from "lodash/omit.js"
import { body, validationResult } from "express-validator"
import jwt from "jsonwebtoken"

const userRouter = express.Router();


//POST /follow
userRouter.post("/:username/follow", requiresAuth, async (request, response) => {
    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;

    const jwtSessionObject = await jwt.verify(
        jwtSession,
        process.env.JWT_SECRET
    );
    const userId = jwtSessionObject.uid;
    
    // get user details
    const user = await request.app.locals.prisma.user.findUnique({
        where: {
            id: userId
        },
    });

    const username = request.params.username;
    

    if (username == user.username) {
        response.send({data: null, message: "you can't follow yourself"});
        return;
    }
 
    const following_user = await request.app.locals.prisma.user.findUnique({
       where: {
                username: username
            }
        });


    if (!following_user) {
            response.send({ data: null, message: "error: user being followed does not exist" });
            return;
        }
    
        


    try {
        const followeduser = await request.app.locals.prisma.follow.create({
            data: {
                followerId: user.id,
                followId: following_user.id
            }
        });

        response.send({ data: followeduser, message: "ok: Followed user "});  
    }
    catch (error) {
        response.send(error);  
    }
});

//DEL /unfollow
userRouter.delete("/:username/unfollow", requiresAuth, async (request, response) => {
    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;

    const jwtSessionObject = await jwt.verify(
        jwtSession,
        process.env.JWT_SECRET
    );
    const userId = jwtSessionObject.uid;
    
    // get user details
    const user = await request.app.locals.prisma.user.findUnique({
        where: {
            id: userId
        },
    });

    const username = request.params.username;
    console.log(username)
    console.log(user.username)

    if (username == user.username) {
        response.send({data: null, message: "you can't unfollow yourself"});
        return;
    }

    const unfollowing_user = await request.app.locals.prisma.user.findUnique({
        where: {
             username: username
             }
         });


    if (!unfollowing_user) {
            response.send({ data: null, message: "error: user being unfollowed does not exist" });
            return;
    }

 try {
    const unfollow = await request.app.locals.prisma.follow.delete({
        where: {
                followId_followerId:{
                    followerId: user.id,
                    followId: Number.parseInt(unfollowing_user.id)}
                }} );

    response.send({data: unfollow, message: "user unfollowed"}); 
 } catch (error) {
    response.send({ data: null, message: "error: user being unfollowed does not exist" });
    return;}
});

//GET /followers/get-all
userRouter.get("/followers/get-all", requiresAuth, async (request, response) => {
    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
        
    const jwtSessionObject = await jwt.verify(
            jwtSession,
            process.env.JWT_SECRET
        );
    
    const userId = jwtSessionObject.uid;


    const listfollowers = await request.app.locals.prisma.follow.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: { followId: userId },
        select: {
            follower: {
                select: {
                    username: true, }
                }
        }
      });

      response.send({"list-followers": listfollowers, message: "showing followers"});
});

//GET /followed-users/get-all
userRouter.get("/followed-users/get-all", requiresAuth, async (request, response) => {
    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
        
    const jwtSessionObject = await jwt.verify(
            jwtSession,
            process.env.JWT_SECRET
        );
    
    const userId = jwtSessionObject.uid;

    const listfollowed = await request.app.locals.prisma.follow.findMany({
    orderBy: {
        createdAt: 'desc',
    }, where: { 
        followerId: userId },
        select: {
            following: {
                select: {
                    username: true, }
                }
        }
  });

    
   response.send({"list-followers": listfollowed, message: "showing followed users"});
});

export default userRouter;