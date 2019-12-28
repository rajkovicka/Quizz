const mongoose = require('mongoose');

const GobletSchema = new mongoose.Schema({
    questions: [
        {
            type: String,
            required: true,
        }
    ],
    answers: [
        {
            type: String,
            required: true,
        }
    ]
})

const Goblet = mongoose.model('Goblet', GobletSchema);

module.exports = { Goblet }