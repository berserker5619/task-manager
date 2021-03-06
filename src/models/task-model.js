const mongoose = require('mongoose')

const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'//create relationship to User model
    }
},{
    timestamps:true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
