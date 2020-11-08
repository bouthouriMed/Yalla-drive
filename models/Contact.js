const mongoose = require('mongoose')


const contactSchema = new mongoose.Schema({
    fullname: {
        type: String,
        requried: true
    },
    email: {
        type: String,
        requried: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});


module.exports = mongoose.model('contact', contactSchema)
