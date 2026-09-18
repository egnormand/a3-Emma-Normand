const express = require('express')
const router = express.Router()
const User = require('../models/user')

//checking login credentials
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username,
            password: req.body.password
        })

        if (!user) {
            return res.status(401).json({message: 'Invalid username or password'})
        }

        res.json({message: 'Login successful', userId: user._id})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//getting all
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (err) {
        //my fault
        res.status(500).json({message: err.message})
    }
})


//getting one
router.get('/:id', getUser, (req, res) => {
    res.json(res.user)
})

//making one
router.post('/', async (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    try {
        const newUser = await user.save()
        //successful creation status
        res.status(201).json(newUser)
    } catch (err){
        //users fault
        res.status(400).json({message: err.message})
    }
})

//updating one
router.patch('/:id', getUser, async (req, res) => {
    if (req.body.username != null) {
        res.user.username = req.body.username
    }
    if (req.body.password != null) {
        res.user.password = req.body.password
    }
    try {
        const updatedUser = await res.user.save()
        res.json(updatedUser)
    } catch (err) {
        //their fault :-P
        res.status(400).json({message: err.message})
    }
})

//deleting one
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.deleteOne()
        res.json({message: 'Deleted User'})
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

//if called, move on
//async bc database is being accessed
async function getUser(req, res, next){
    let user //undefined
    try{
        user = await User.findById(req.params.id)
        if(user === null){
            return res.status(404).json({message: 'Cannot find user'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    res.user = user
    next()
}

//getting a user's todo items
router.get('/:id/todos', getUser, (req, res) => {
    res.json(res.user.todoItems)
})

//adding a todo item to a user
router.post('/:id/todos', getUser, async (req, res) => {
    res.user.todoItems.push({
        text: req.body.text,
        dueDate: req.body.dueDate,
        completed: req.body.completed || false
    })

    try {
        await res.user.save()
        res.status(201).json(res.user.todoItems[res.user.todoItems.length - 1])
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

//updating a todo item
router.patch('/:id/todos/:todoId', getUser, async (req, res) => {
    const todo = res.user.todoItems.id(req.params.todoId)

    if (!todo) {
        return res.status(404).json({message: 'Cannot find todo item'})
    }

    if (req.body.text != null) {
        todo.text = req.body.text
    }
    if (req.body.dueDate != null) {
        todo.dueDate = req.body.dueDate
    }
    if (req.body.completed != null) {
        todo.completed = req.body.completed
    }

    try {
        await res.user.save()
        res.json(todo)
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

//deleting a todo item
router.delete('/:id/todos/:todoId', getUser, async (req, res) => {
    const todo = res.user.todoItems.id(req.params.todoId)

    if (!todo) {
        return res.status(404).json({message: 'Cannot find todo item'})
    }

    todo.deleteOne()

    try {
        await res.user.save()
        res.json({message: 'Deleted todo item'})
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

module.exports = router