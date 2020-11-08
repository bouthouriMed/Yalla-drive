const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    register_date: {
        type: Date,
        default: Date.now()
    },
    role: {
        type: String,
        default: 'user'
    },
    notifications: [
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "user"
            },
            msg:{
                type: String
            }
        }
    ]
});


module.exports = mongoose.model('user', userSchema)