const mongoose = require('mongoose');

const GeographySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    }
})

const Geography = mongoose.model('Geography', GeographySchema);

module.exports = { Geography }