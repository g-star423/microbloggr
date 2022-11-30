# FLIMFLAM
Second General Assembly Software Engineering Project

## This project is essentially a message board / Twitter clone.

# What's used:
The app uses Node / Express and Mongoose / MongoDB

# Routes
This app allows you to create a user profile with a password.

In the future, I would design the project to use express router.

# Infinite Scroll:
This feature took the longest of any other feature, and ate into my design / styling time.

The page will fetch only the first 10 documents

To do this feature, I had to code my cards twice - the first ten come through on-load in the EJS file. After that, jQuery is used to load them in.
Each time the user gets within 10px of the page bottom, an AJAX request is made on the client-side JS file, to a get route on the express server. The server sends only 10 documents, which are then added to the DOM by jQuery. After there are no more documents, a final DIV is added, and the client won't make any more server requests.

# Security:
This app uses user authentication to lock down most routes to prevent users from editing each other's profiles and posts.
Passwords are stored "salted" - the user's password is not stored in plaintext on the server.
API keys are stored in .env file locally, and are stored on Heroku as environmental variables.
A moderator function is available that create a "superuser" that can access all routes.

This app is vulnerable to most attacks that I have read about - data sanitization would be the first security feature to add, but time was a factor.

# Moderation:
It is alarming that anyone could post anything to this app - content moderation can't be ignored, and adding some AI moderation would be a future goal.

# Styling 
I ran out of time on this one, but the basics of the design I was going for are there.