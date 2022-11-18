require('dotenv').config()

const express = require('express');
const app = express();
const methodOverride = require('method-override');
const { response, request } = require('express');
const postSeeds = require('./models/seedData.js');

const mongoose = require('mongoose');
const MicroPost = require('./models/postSchema.js');

/////////////////
// Middleware
/////////////////
app.use(express.static('public'))
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
app.post('/posts', (req, res) => {
    MicroPost.create(req.body, (error, createdFruit) => {
        res.redirect('/feed')
    })
})

//landing page
app.get('/', (request, response) => {
    response.render('landing.ejs', {
        testVar: process.env.SECRET_KEY,
        pageName: "Welcome!"
    })
})
// route to new post page
app.get('/new', (req, res) => {
    res.render('new.ejs');
});


//index page
app.get('/feed', (request, response) => {
    MicroPost.find({}, (error, foundPosts) => {
        response.render('index.ejs', {
            posts: foundPosts,
            pageName: 'Post Feed'
        })
    })
})

app.get('/posts/:id', (req, res) => {
    MicroPost.findById(req.params.id, (error, foundPost) => {
        res.render(
            'show.ejs',
            {
                post: foundPost
            }
        );
    })
})

app.get('/posts/:id/edit', (req, res) => {
    MicroPost.findById(req.params.id, (error, foundPost) => {
        res.render(
            'update.ejs',
            {
                post: foundPost
            }
        );
    })
})

//delete route
app.delete('/posts/:id', (req, res) => {
    MicroPost.findByIdAndRemove(req.params.id, (error, data) => {
        res.redirect('/feed');
    })
    // res.send('deleting...');
})

app.put('/posts/:id', (req, res) => {
    MicroPost.findByIdAndUpdate(req.params.id, req.body, (err, updatedModel) => {
        res.redirect('/feed');
    });
})

mongoose.connect('mongodb+srv://gstar:' + process.env.MONGO_PASSWORD + '@cluster0.lrovc1s.mongodb.net/?retryWrites=true&w=majority', () => {
    console.log('The connection with mongod is established');
})

// mongoose.connect('mongodb://localhost:27017/microblog', () => {
//     console.log('The connection with mongod local is established');
// })

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, () => {
    console.log("Hello Seattle, I'm listening");
});

