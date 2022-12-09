import express from "express"
import pick from "lodash/pick.js"

const unAuthRouter = express.Router();

unAuthRouter.get("/profile/:username", async (request, response) => {
    const username = request.params.username;
    const following_user = await request.app.locals.prisma.user.findUnique({
        where: {
                 username: username
             }
         });
    
    if (!following_user) {
    response.send({ data: null, message: "error: user being followed does not exist" });
    return;
    }

    const filteredBody= pick(following_user, ["username", "bio"]);

    response.send({data:filteredBody, message:"unAuthorized access, sign-in to view more information"})
});

unAuthRouter.get("/follower/:username", async (request, response) => {
    const username = request.params.username;  
    const follower = await request.app.locals.prisma.user.findUnique({
      where: { username: username },
    });

    if (!follower) {
        response.send({ data: null, message: "error: user being followed does not exist" });
        return;
        }

  try {

      const follower_user = await request.app.locals.prisma.follow.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: { followId: follower.id },
        select: {
            follower: {
                select: {
                    username: true, 
                    bio:true}
                }
        },
        take: 15,
      });
  
      response.send({ Follower: follower_user, message: "ok" });
   
} catch {
    response.send({ data: null, message: "error in following" });
}
});


unAuthRouter.get("/following/:username", async (request, response) => {
    const username = request.params.username;
    const following = await request.app.locals.prisma.user.findUnique({
      where: { username: username },
    });
  

    if (!following) {
        response.send({ data: null, message: "error: user being followed does not exist" });
        return;
        }

  try {

      const following_user = await request.app.locals.prisma.follow.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: { followerId: following.id },
        select: {
            following: {
                select: {
                    username: true,
                    bio:true }
                }
        },
        take: 15,
      });
  
      response.send({ Following: following_user, message: "ok" });
   
} catch {
    response.send({ data: null, message: "error in following" });
}
});

export default unAuthRouter;