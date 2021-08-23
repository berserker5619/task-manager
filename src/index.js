const express = require('express')

require('./db/mongoose')

const userRouter = require('./routers/user-router')
const taskRouter = require('./routers/task-router')

const app = express()
const port = process.env.PORT

app.use(express.json())//parse json to object
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is running on port ', port)
})