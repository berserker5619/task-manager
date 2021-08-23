const express = require('express')
const Task = require('../models/task-model')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

//GET /tasks?completed:true
//GET /tasks?limit=3&skip=2
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    const sort={}
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'? -1:1
    }
    try {
        // const tasks = await Task.find({owner:req.user._id})//method 1
        //res.send(tasks)

        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
                    // createdAt:1//ascending
                    // createdAt:-1//descending
                    // completed:1//incomplete->complete
                    // completed:-1//complete->incomplete
            }
        }).execPopulate()//method 2
        res.send(req.user.tasks)
    }
    catch (error) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })//fetch only the created task only if logged in
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }
    catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isvalid = updates.every((item) => {
        return allowedUpdates.includes(item)
    })
    if (!isvalid) {
        return res.status(400).send({ error: 'Invalid Update' })
    }
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })//find the user        
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((field) => {//update the user
            task[field] = req.body[field]
        })
        await task.save()//save the update
        res.send(task)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.status(204).send()
    }
    catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router