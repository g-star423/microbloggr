const dotenv = require('dotenv').config()

const express = require('express');
const app = express();
const methodOverride = require('method-override');
// const { response, request } = require('express');
const postSeeds = require('./models/seedData.js');

// added these for auth
const session = require('express-session')

// dependencies for user auth
const bcrypt = require('bcrypt');
const User = require('./models/userSchema.js');

app.use(
    session({
        secret: process.env.SESSION_SECRET, //a random string do not copy this value or your stuff will get hacked
        resave: false, // default more info: https://www.npmjs.com/package/express-session#resave
        saveUninitialized: false // default  more info: https://www.npmjs.com/package/express-session#resave
    })
)

function isAuthenticated(req, res, next) {// for general authentication
    if (req.session.currentUser) {
        return next();
    } else {
        res.redirect('/login')
    }
}

function isAuthenticatedPost(req, res, next) { // will lock down put and delete routes that update posts by ID to only users that match post's poster ID
    MicroPost.findById(req.params.id, (error, foundPost) => {
        if (req.session.currentUser._id === foundPost.posterID || req.session.currentUser.isModerator) {
            return next();
        } else {
            res.send('not authorized');
        }
    })
}

function isAuthenticatedProfile(req, res, next) { // will lock down put route for user profile update using user's id
    if (req.session.currentUser._id === req.params.id) {
        return next();
    } else {
        res.send('not authorized');
    }
}

function returnTags(postBody) {
    let tags = postBody.match(/#[a-z]+/gi)
    let empty = []
    if (tags) {
        return tags
    } else {
        return empty
    }
}

function returnMentions(postBody) {
    let mentions = postBody.match(/@[a-z]+/gi)
    let empty = []
    if (mentions) {
        return mentions
    } else {
        return empty
    }
}


const mongoose = require('mongoose');
const MicroPost = require('./models/postSchema.js');
const e = require('express');

/////////////////
// Middleware
/////////////////
app.use(express.static('public')) // letting express know where the static folder is
app.use(express.urlencoded({ extended: true }));// standard - this is just how you get url encoded data into JSON
app.use(methodOverride('_method'));


/////////////////
// Routes
/////////////////
// seed route
// app.get('/posts/seed', (request, response) => {
//     MicroPost.create(postSeeds, (error, data) => {
//         response.send('database seeded with:' + data);
//     })
// })

// route to post new post
app.post('/posts', isAuthenticated, (req, res) => {
    req.body.author = req.session.currentUser.username
    req.body.posterID = req.session.currentUser._id
    req.body.tags = returnTags(req.body.postBody)
    req.body.mentions = returnMentions(req.body.postBody)
    MicroPost.create(req.body, (error, createdItem) => {
        res.redirect('/feed')
    })
})

//landing page
app.get('/', (req, res) => {// add logic so if user is logged in, redirect to feed page
    res.render('landing.ejs', {
        pageName: "Welcome!",
        currentUser: req.session.currentUser,
        pageTitle: "FLIMFLAM"
    })
})
// route to new post page
app.get('/new', isAuthenticated, (req, res) => {
    res.render('new.ejs', {
        currentUser: req.session.currentUser,
        pageTitle: "New Post"
    });
});
// route to news feed
app.get('/feed', (req, res) => {
    MicroPost.find({}).sort({ createdAt: -1 }).limit(10).exec(
        (error, foundPosts) => {
            res.render('index.ejs', {
                posts: foundPosts,
                pageName: 'Post Feed',
                currentUser: req.session.currentUser,
                pageTitle: "FLIMFLAM - What's Happening"
            })
        })
})
// route to search posts by a tag - %23 must replace #, because # has a different meaning in a URL
app.get('/feed/search/:tag', (req, res) => {
    MicroPost.find({ tags: req.params.tag }).sort({ createdAt: -1 }).exec(
        (error, foundPosts) => {
            res.render('index.ejs', {
                posts: foundPosts,
                pageName: 'Post Feed',
                currentUser: req.session.currentUser,
                pageTitle: "FLIMFLAM - What's Happening"
            })
        })
})
// route to display a specific post by ID
app.get('/posts/:id', (req, res) => {
    MicroPost.findById(req.params.id, (error, foundPost) => {
        res.render(
            'show.ejs',
            {
                post: foundPost,
                currentUser: req.session.currentUser,
                pageTitle: "Showing Post"
            }
        );
    })
})


//show to edit post
app.get('/posts/:id/edit', isAuthenticated, (req, res) => {
    MicroPost.findById(req.params.id, (error, foundPost) => {
        res.render(
            'update.ejs',
            {
                post: foundPost,
                currentUser: req.session.currentUser,
                pageTitle: "Editing Post"
            }
        );
    })
})

/////////////////
// USER PROFILE
/////////////////

app.get('/profile/:username', (req, res) => {
    User.findOne({ username: req.params.username }, (err, foundProfile) => {
        if (foundProfile === null) { // for some reason, for this to work, has to be strictly equal to null - just (foundprofile) doesn't work
            res.send('profile not found!')
        } else {
            MicroPost.find({ author: req.params.username }).sort({ updatedAt: -1 }).exec((err, foundPosts) => {
                res.render(
                    'profile.ejs',
                    {
                        currentUser: req.session.currentUser,
                        profile: foundProfile,
                        pageTitle: "FLIMFLAM - " + foundProfile.username,
                        posts: foundPosts
                    }
                )
            })
        }
    })
})

//route to show user profile edit page
app.get('/editprofile', isAuthenticated, (req, res) => {
    res.render(
        'editprofile.ejs',
        {
            currentUser: req.session.currentUser,
            pageTitle: "FLIMFLAM - Edit Profile"
        }
    )
}
)

//update profile PUT route
app.put('/profile/:id', isAuthenticatedProfile, (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, (err, updatedModel) => {
        res.redirect('/feed');
    });
})


//delete route
app.delete('/posts/:id', isAuthenticatedPost, (req, res) => {
    MicroPost.findByIdAndRemove(req.params.id, (error, data) => {
        res.redirect('/feed');
    })
    // res.send('deleting...');
})
// route to PUT updated post
app.put('/posts/:id', isAuthenticatedPost, (req, res) => {
    req.body.author = req.session.currentUser.username
    req.body.posterID = req.session.currentUser._id
    req.body.tags = returnTags(req.body.postBody)
    req.body.mentions = returnMentions(req.body.postBody)
    MicroPost.findByIdAndUpdate(req.params.id, req.body, (err, updatedModel) => {
        res.redirect('/feed');
    });
})


/////////////////
// AUTH Routes
/////////////////
// display newuser page
app.get('/newuser', (req, res) => {
    res.render('newUser.ejs', {
        currentUser: req.session.currentUser,
        pageTitle: "FLIMFLAM - Sign Up!"
    })
})

// display login page
app.get('/login', (req, res) => {
    res.render('login.ejs', {
        currentUser: req.session.currentUser,
        pageTitle: "FLIMFLAM - Log On!"
    })
})

// new user POST route
app.post('/newuser', (req, res) => {// code mostly from auth lesson in project 2 folder.
    req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)) // salting password before storing
    User.create(req.body, (err, createdUser) => { //need logic to tell if username failed because not unique, or some other error message
        if (err) {
            res.send(err);
            console.log(err);
        }
        console.log('user is created', createdUser)
        res.redirect('/feed')
    })
})

///////////////////////////////////
// GET Routes for Infinite Scroll
///////////////////////////////////
app.get('/scroll/:lastPost', (req, res) => {
    MicroPost.find({}).sort({ updatedAt: -1 }).skip(req.params.lastPost).limit(10).exec(
        (error, foundPosts) => {
            let endOfFeed = false
            if (error) {
                console.log(error);
            }
            if (foundPosts.length === 0) {
                endOfFeed = true;
            }
            if (!endOfFeed) {
                res.send(foundPosts)
            } else {
                res.send(false)
            }
        })
})

app.get('/userauth', (req, res) => {
    res.send(req.session.currentUser)
})


// login POST route
app.post('/login', (req, res) => {
    // look for username
    User.findOne({ username: req.body.username }, (err, foundUser) => {
        // error handling
        if (err) {
            console.log(err);
            res.send('DB Problem' + err)
        } else if (!foundUser) { // will run if foundUser isn't truthy
            res.send('USER NOT FOUND')
        } else { // if we get to here, user is found
            if (bcrypt.compareSync(req.body.password, foundUser.password)) {
                // adding user to session
                req.session.currentUser = foundUser
                // once user is found and session is created, redirect to index
                res.redirect('/feed')
            } else { // runs if password doesn't match
                res.send('invalid password')
            }
        }
    })

})
// where delete request gets sent to
app.delete('/endsession', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})



mongoose.connect('mongodb+srv://gstar:' + process.env.MONGO_PASSWORD + '@cluster0.lrovc1s.mongodb.net/?retryWrites=true&w=majority', () => {
    console.log('The connection with mongod is established');
})


// mongoose.connect('mongodb://localhost:27017/microblog', () => { // offline connection
//     console.log('The connection with mongod local is established');
// })

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, () => {
    console.log("Hello Seattle, I'm listening");
});

