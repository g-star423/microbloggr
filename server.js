require('dotenv').config()

const express = require('express');
const app = express();
const methodOverride = require('method-override');
const { response, request } = require('express');

const mongoose = require('mongoose');
// const Budget = require('./models/budgetSchema.js');

/////////////////
// Middleware
/////////////////
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));// standard - this is just how you get url encoded data into JSON
app.use(methodOverride('_method'));


/////////////////
// Routes
/////////////////

app.get('/', (request, response) => {
    response.render('index.ejs', {
        testVar: process.env.SECRET_KEY
    })
})

// mongoose.connect('mongodb://localhost:27017/microbloggr', () => {
//     console.log('The connection with mongod is established');
// })

// app.listen(3000, () => {
//     console.log("listening...");
// });

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port, () => {
    console.log("Hello Seattle, I'm listening");
});