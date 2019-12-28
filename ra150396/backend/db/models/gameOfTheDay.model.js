const mongoose = require('mongoose');

const GameOfTheDaySchema = new mongoose.Schema({
    _anagramGameId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    _game5x5GameId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    _gobletGameId: {
        type: mongoose.Types.ObjectId,
        default: null
    },
    date: {
        type: String,
        required: true
    },
    numOfPlayers: {
        type: Number,
        default: 0
    }
})

const GameOfTheDay = mongoose.model('GameOfTheDay', GameOfTheDaySchema);

module.exports = { GameOfTheDay }