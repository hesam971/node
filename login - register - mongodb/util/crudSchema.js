const mongoose = require('mongoose');

const crud = new mongoose.Schema({
    todoName:{
        type:String
    }
});

module.exports = mongoose.model('todoList',crud);