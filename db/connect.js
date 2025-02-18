const mongoose = require('mongoose');
require('dotenv').config();

function connectionToMongodb() {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/blogDB');

    mongoose.connection.on('connected', () => {
        console.log('MongoDB connection successful');
    });

    mongoose.connection.on('error', (err) => {
        console.error(err);
        console.log('MongoDB connection unsuccessful');
    });
}

module.exports = { connectionToMongodb };

//In the above code, we are using the dotenv package to load environment variables.