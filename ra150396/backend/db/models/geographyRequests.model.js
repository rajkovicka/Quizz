const mongoose = require('mongoose');

const GeographyRequestSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        default: null
    }
})

const GeographyRequest = mongoose.model('GeographyRequest', GeographyRequestSchema);

module.exports = { GeographyRequest }