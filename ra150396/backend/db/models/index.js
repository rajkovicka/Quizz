const {User} = require('./user.model');
const {Game} = require('./game.model');
const {Anagram} = require('./games/anagram.model');
const {Game5x5} = require('./games/5x5.model');
const {Goblet} = require('./games/goblet.model');
const {GameOfTheDay} = require('./gameOfTheDay.model');
const {Geography} = require('./games/geography.model');
const {GeographyRequest} = require('./geographyRequests.model');

module.exports = {
    User,
    Game,
    Anagram,
    Game5x5,
    Goblet,
    GameOfTheDay,
    Geography,
    GeographyRequest
}