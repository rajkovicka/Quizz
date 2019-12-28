const mongoose = require('mongoose');

const Game5x5Schema = new mongoose.Schema({
    words: [
        {
            type: String,
            required: true,
        }
    ]
})

const Game5x5 = mongoose.model('Game5x5', Game5x5Schema);

module.exports = { Game5x5 }