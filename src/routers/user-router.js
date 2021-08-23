const express = require('express')
const multer=require('multer')
const sharp=require('sharp')

const User = require('../models/user-model')
const auth = require('../middleware/auth')
const {sendWelcomeMail,sendCancellationMail}=require('../emails/account')

const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeMail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }
    catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token//delete token on logout
        })
        await req.user.save()
        res.send()
    }
    catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch (error) {
        res.status(500).send()
    }
})

//view user profile
router.get('/users/me', auth, async (req, res) => {//middleware for authentication
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isvalid = updates.every((item) => {
        return allowedUpdates.includes(item)
    })
    if (!isvalid) {
        return res.status(400).send({ error: 'Invalid Update' })
    }
    try {
        updates.forEach((field) => {//update the user
            req.user[field] = req.body[field]
        })
        await req.user.save()//save the update
        res.send(req.user)
    }
    catch (error) {
        res.status(400).send(error)
    }
})
//put->update entire data//patch->update a part of the data

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationMail(req.user.email,req.user.name)
        res.send(req.user)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

//upload image
const upload=multer({
    // dest:'avatar',//save in a folder
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){//cb->callback
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('File must be an image'))
        }
        cb(undefined,true)//process upload
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()//convert to png and crop 250*250
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

//delete image
router.delete('/users/me/avatar',auth,async(req,res)=>{
    try{
        req.user.avatar=undefined
        await req.user.save()
        res.send()
    }
    catch(error){
        res.status(400).send()
    }
})

//view image
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user ||!user.avatar){
            throw new Error('')
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }
    catch(error){
        res.status(400).send()
    }
})

module.exports = router
