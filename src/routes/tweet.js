import requiresAuth from "../middleware/requiresAuth.js"
import express from "express"
import pick from "lodash/pick.js"
import omit from "lodash/omit.js"
import { body, validationResult } from "express-validator"
import jwt from "jsonwebtoken"

const tweetRouter = express.Router();

// POST /tweet
tweetRouter.post("/tweet",
    [
    body("content")
    .notEmpty()
    .isLength({max: 280})
    .withMessage("tweet is maxed at 280 characters")
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
            const filteredBody = pick(request.body, ["content"]); 
            const userId = jwtSessionObject.uid;    
            filteredBody.userid = userId;

            const tweet = await request.app.locals.prisma.tweet.create({
              data: {
               content: request.body.content,
               userid: userId,
              },
            });
        
            response.send({data: tweet, message: "tweet posted"});        
    });
   
//POST /:tweetid/favorite
tweetRouter.post("/:tweetId/favorite", requiresAuth, async (request, response) => {
  const tweetId = request.params.tweetId;
  const tweetnum_id = Number.parseInt(tweetId);
  const cookies = request.cookies;
  const jwtSession = cookies.sessionId;

  const jwtSessionObject = await jwt.verify(
      jwtSession,
      process.env.JWT_SECRET
  );
  const userId = jwtSessionObject.uid;
  
  const tweet = await request.app.locals.prisma.tweet.findUnique({
      where: {
          id: tweetnum_id
      }
  });

  if (!tweet) {
      response.send({data: null, message:"tweet does not exist"});
      return;
  }

  try {
      const favorite = await request.app.locals.prisma.favorite.create({
          data: {
              userid: userId,
              tweetId: tweetnum_id
          },
          include: {
              tweet: {
                  select: {
                      content: true
                  }
              }
          }
      });
      response.send({data:favorite, message:"tweet added to your favorites"});
      
  } catch {
      response.send({data:null, message:"error: has occured"});
  }

});
  
// DEL /:tweetId/unfavorite
tweetRouter.delete("/:tweetId/unfavorite", requiresAuth, async (request, response) => {
const tweetId = request.params.tweetId;
const tweetnum_id = Number.parseInt(tweetId);
const cookies = request.cookies;
const jwtSession = cookies.sessionId;

const jwtSessionObject = await jwt.verify(
    jwtSession,
    process.env.JWT_SECRET
);
const userId = jwtSessionObject.uid;

const tweet = await request.app.locals.prisma.tweet.findUnique({
    where: {
        id: tweetnum_id
    }
});

if (!tweet) {
    response.send({data: null, message:"tweet does not exist"});
    return;
}

  try {
      const unfavorite = await request.app.locals.prisma.favorite.delete({
          where: {
              userid_tweetId: {
                userid: userId,
                tweetId: tweetnum_id
              } } });

      response.send({data: unfavorite, message: "tweet has been removed from favorites"});       
      
  } catch {
    response.send({data:null, message:"error: has occured"});
  }

});

// DEL /:tweetId/untweet
tweetRouter.delete("/:tweetId/untweet",requiresAuth, async(request, response) => {
 
  const tweetId = request.params.tweetId;
  const tweetnum_id = Number.parseInt(tweetId);
  const cookies = request.cookies;
  const jwtSession = cookies.sessionId;
  
  const jwtSessionObject = await jwt.verify(
      jwtSession,
      process.env.JWT_SECRET
  );

  const userId = jwtSessionObject.uid;
  
  const tweet = await request.app.locals.prisma.tweet.findUnique({
      where: {
          id: tweetnum_id
      }
  });
  
  if (!tweet) {
      response.send({data: null, message:"tweet does not exist"});
      return;
  }
  
  if (userId !== tweet.userid) {response.status(401).json({error: "error: tweet cannot be deleted"});
    return;
};

try {
  const untweet = await request.app.locals.prisma.tweet.delete({
    where: {
      id: tweetnum_id,
    },
  });
  
  response.send({data: untweet, message: "tweet deleted"});
} catch (error) {
  response.send({data: null, message: "error in deleting tweet"});
}

});

//POST /:tweetId/reply
tweetRouter.post("/:tweetId/reply",
  [
      body("content")
      .notEmpty()
      .isLength({max: 280})
      .withMessage("tweet is maxed at 280 characters, should not be empty"),
  ], requiresAuth, async (request, response) => {
   
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

    const tweetId_params = request.params.tweetId;
    const tweetnum_id = Number.parseInt(tweetId_params);
   
    const tweet = await request.app.locals.prisma.tweet.findUnique({
      where: {
        id: tweetnum_id,
      }
  });

  if (!tweet) {
      response.send({data: null, message:"tweet does not exist"});
      return;
  }
  const filteredBody = pick(request.body, ["content"])
  filteredBody.userid = userId;
  filteredBody.tweetId = tweetnum_id;
    
    try {
        const reply = await request.app.locals.prisma.reply.create({
            data: filteredBody });
            response.send({data: reply, message: "reply sent!"});
    } catch {
      response.send({data: tweet, message: "error in sending reply in the tweet"}); 
    }
});

//GET /tweet/get-all
tweetRouter.get('/tweet/get-all',requiresAuth, async (request, response) => {
    const cookies = request.cookies;
    const jwtSession = cookies.sessionId;
        
    const jwtSessionObject = await jwt.verify(
            jwtSession,
            process.env.JWT_SECRET
        );
    
    const userId = jwtSessionObject.uid;
    console.log(userId)

      const tweet = await request.app.locals.prisma.tweet.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where: { userid: Number.parseInt(userId) },
      });

      response.send ({data:tweet, message: "Showing tweets"})
   

});

//GET /reply/get-all
tweetRouter.get('/reply/get-all',requiresAuth, async (request, response) => {
  const cookies = request.cookies;
  const jwtSession = cookies.sessionId;
      
  const jwtSessionObject = await jwt.verify(
          jwtSession,
          process.env.JWT_SECRET
      );
  
  const userId = jwtSessionObject.uid;
  console.log(userId)

    const replies = await request.app.locals.prisma.reply.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      where: { userid: Number.parseInt(userId) },
    });

    response.send ({data:replies, message: "showing replies"})
  });

//GET /tweets-replies/get-all
tweetRouter.get('/tweets-replies/get-all',requiresAuth, async (request, response) => {
    
  const cookies = request.cookies;
  const jwtSession = cookies.sessionId;
      
  const jwtSessionObject = await jwt.verify(
          jwtSession,
          process.env.JWT_SECRET
      );
  
  const userId = jwtSessionObject.uid;

  const tweetsreplies = await request.app.locals.prisma.tweet.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: { userid: userId },
    include: {
      reply: true,
    },
  });
  
  response.send({"user-tweets-replies": tweetsreplies, message: "showing tweets and replies"});
  
});

//GET /favorite/get-all
tweetRouter.get('/favorite/get-all', requiresAuth,async (request, response) => {
  const cookies = request.cookies;
  const jwtSession = cookies.sessionId;
      
  const jwtSessionObject = await jwt.verify(
          jwtSession,
          process.env.JWT_SECRET
      );
  
  const userId = jwtSessionObject.uid;

  const listfavorites = await request.app.locals.prisma.favorite.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: { userid: userId },
    include: {
      tweet: true,
    },
  });

  response.send({"list-favorites": listfavorites, message: "showing favorites"});
 
});


export default tweetRouter;