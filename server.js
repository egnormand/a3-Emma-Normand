//file requirements
require('dotenv').config()

//package requirements
const express = require('express')
const app = express()
const mongoose = require('mongoose')

//setup json
app.use(express.json())
app.use(express.static(__dirname))

const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const port = process.env.PORT || 3000

if (!process.env.DATABASE_URL) {
	console.error('DATABASE_URL is not configured')
	process.exit(1)
}

mongoose.connect(process.env.DATABASE_URL)
	.then(() => {
		console.log('Connected to Database')
		app.listen(port, () => console.log(`Server Started on port ${port}`))
	})
	.catch((error) => {
		console.error('Database connection failed:', error.message)
		process.exit(1)
	})