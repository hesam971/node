const mongoose = require('mongoose');

const db = mongoose.connect('mongose config').
then(() => {console.log('databse connected')}).
catch((err) => {throw err});

module.exports = db;