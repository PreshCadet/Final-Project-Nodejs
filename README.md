Final Project - Precious Sorita
Node js

## Supported Behaviors:

- User can sign up for an account
    - firstName
    - lastName
    - username
    - email
    - password
    - bio
    - birthday - if below 18 years old, reject sign up
- User can sign in via email or username
- User can change his/her password
- User can update twitter username and bio
- User cannot update birthday
- User can create a tweet
    - Each tweet caps **280 characters**
- User can follow another User
    - implies that a user cannot follow him or herself
- User can favorite a tweet
    - implies
    - this includes the user’s own tweets
    - implies that a user cannot favorite an already favorited tweet
- User can reply to a tweet
    - this includes the user’s own tweets
- User can unfavorite a tweet already favorited
    - implies a user cannot unfavorite a tweet not already favorited
- User can unfollow a User being followed
    - implies a user cannot unfollow a user he/she is not already following
- User can delete his/her tweet
- User can list all his/her tweets that are not replies
    - default sorted by newest
- User can list all of his/her replies
    - default sorted by newest
- User can list BOTH all of his/her tweets AND replies
    - default sorted by newest
- User can list all his/her favorited tweets
    - default sorted by newest
- User can list all his/her followers
- User can list all his/her followed Users
- **If you are not authenticated**
    - you cannot view any user tweets (including replies)
    - you can only view a user’s username and bio
    - you cannot view a user’s favorites
    - you can only view max 15 users that a user follows
    - you can only view max 15 followers from a user

Thank you very much!
