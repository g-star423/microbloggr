const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: String, required: true },
    postBody: { type: String, required: true },
    tags: [String],
    mentions: [String],
    posterID: String
}, { timestamps: true });

const postModel = mongoose.model('Post', postSchema);

module.exports = postModel;