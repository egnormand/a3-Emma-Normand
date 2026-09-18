//file requirements
require('dotenv').config()

//package requirements
const express = require('express')
const app = express()
const mongoose = require('mongoose')

//connect to database
mongoose.connect(process.env.DATABASE_URL) //super secret database
const db = mongoose.connection
db.on('error',(error) => console.error(error))
//show database has been connected
db.once('open',() => console.error('Connected to Database'))

//setup json
app.use(express.json())
app.use(express.static(__dirname))

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

//show server has started
app.listen(3000, () => console.log('Server Started'))