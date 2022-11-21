const mongoose = require('mongoose') // this code is from auth lesson
const Schema = mongoose.Schema

const userSchema = Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    isModerator: Boolean,
    profilePicURL: String,
    aboutMe: String
})

const User = mongoose.model('User', userSchema)

module.exports = User