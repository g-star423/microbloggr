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

function isAuthenticated(req, res, next) {
    if (req.session.currentUser) {
        return next();
    } else {
        res.redirect('/login')
    }
}
// function isAuthenticatedandAuthorized(req, res, next) {
//     if (req.secret.currentUser)
// }


const mongoose = require('mongoose');
const MicroPost = require('./models/postSchema.js');

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
    MicroPost.create(req.body, (error, createdItem) => {
        res.redirect('/feed')
    })
})

//landing page
app.get('/', (req, res) => {// add logic so if user is logged in, redirect to feed page
    res.render('landing.ejs', {
        pageName: "Welcome!",
        currentUser: req.session.currentUser
    })
})
// route to new post page
app.get('/new', isAuthenticated, (req, res) => {
    res.render('new.ejs', {
        currentUser: req.session.currentUser
    });
});


//index page (news feed page)
app.get('/feed', (req, res) => {
    MicroPost.find({}, (error, foundPosts) => {
        res.render('index.ejs', {
            posts: foundPosts,
            pageName: 'Post Feed',
            currentUser: req.session.currentUser
        })
    })
})

app.get('/posts/:id', (req, res) => {
    MicroPost.findById(req.params.id, (error, foundPost) => {
        res.render(
            'show.ejs',
            {
                post: foundPost,
                currentUser: req.session.currentUser
            }
        );
    })
})

app.get('/posts/:id/edit', isAuthenticated, (req, res) => {
    MicroPost.findById(req.params.id, (error, foundPost) => {
        res.render(
            'update.ejs',
            {
                post: foundPost,
                currentUser: req.session.currentUser
            }
        );
    })
})

/////////////////
// USER PROFILE
/////////////////

app.get('/profile/:id', (req, res) => {
    User.findById(req.params.id, (error, foundProfile) => {
        res.render(
            'profile.ejs',
            {
                profile: foundProfile,
                currentUser: req.session.currentUser
            }
        )
    })
})

//delete route
app.delete('/posts/:id', isAuthenticated, (req, res) => {
    MicroPost.findByIdAndRemove(req.params.id, (error, data) => {
        res.redirect('/feed');
    })
    // res.send('deleting...');
})
//update post
app.put('/posts/:id', isAuthenticated, (req, res) => {
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
        currentUser: req.session.currentUser
    })
})

// display login page
app.get('/login', (req, res) => {
    res.render('login.ejs', {
        currentUser: req.session.currentUser
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

