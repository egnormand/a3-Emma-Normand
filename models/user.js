const mongoose = require('mongoose')

const todoItemSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    dueDate: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    }
}, { _id: true })

//properties of user
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    todoItems: {
        type: [todoItemSchema],
        default: []
    }
})

module.exports = mongoose.model('User', userSchema)