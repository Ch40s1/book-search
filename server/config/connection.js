const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://xxdanielzxx826:hdxd5u2zHQ4GhvTc@cluster0.qdorelp.mongodb.net/');

module.exports = mongoose.connection;
