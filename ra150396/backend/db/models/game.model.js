const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    _gameId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    gameType: {
        type: String,
        required: true
    }
})

const Game = mongoose.model('Game', GameSchema);

module.exports = { Game }