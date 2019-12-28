const mongoose = require('mongoose');

const AnagramSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
})

const Anagram = mongoose.model('Anagram', AnagramSchema);

module.exports = { Anagram }