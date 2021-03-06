const mongoose = require('mongoose')
const config = require('config')

const connectDB =  async () => {
    try {
       await mongoose.connect(config.get('mongoURI'), {
           useNewUrlParser: true,
           useUnifiedTopology: true,
           useCreateIndex: true,
           useFindAndModify: false
       });
       console.log('Mongo successfully connected...')
    } catch (err) {
        console.error(err.message)
    }
};

module.exports = connectDB