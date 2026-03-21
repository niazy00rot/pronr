const router = require('express').Router()
const jwt = require('jsonwebtoken')
const {send_invite,get_user_invites,respond_invite,send_join,get_join,respond_join}= require('../../db/requist.js')

router.post('/invite', async (req,res)=>{
    const auth = req.headers.authorization
    const {username,project_id}= req.body
    const token = auth.split(' ')[1]
    try{
        const id = await jwt.verify(token,process.env.JWT_SECRET).id.id
        const r = await send_invite(id, username, project_id)
        if(r.error){
           return res.status(400).json(r)
        }
        res.status(201).json(r)
    }
    catch(err){
        console.error(err)
        res.status(500).json({ error: 'Server error' })
    }
})

router.get('/invites', async(req,res)=>{
    const auth= req.headers.authorization
    const token = auth.split(' ')[1]
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        const data = await get_user_invites(id)
        res.status(200).json(data)
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:'Server error'})
    }
})

router.post('/invites/respond',async (req,res)=>{
    const auth= req.headers.authorization
    const token = auth.split(' ')[1]
    const {project_id,status} = req.body
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        const re= await respond_invite(id,project_id,status)
        res.status(200).json(re)
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:'Server error'})
    }
}) 


router.post('/request',async (req,res)=>{
    const auth= req.headers.authorization
    const token = auth.split(' ')[1]
    const {project_id} = req.body
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        const re= await send_join(id,project_id)
        if(re.error){
           return res.status(400).json(re)
        }
        res.status(200).json(re)
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:'Server error'})
    }
})

router.get('/requests',async (req,res)=>{
    const auth= req.headers.authorization
    const token = auth.split(' ')[1]
    const project_id = req.query.project_id
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        const data = await get_join(id, project_id)
        if(data.error){
           return res.status(400).json(data)
        }
        res.status(200).json(data)
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:'Server error'})
    }
})

router.post('/requests/respond', async (req,res)=>{
    const auth= req.headers.authorization
    const token = auth.split(' ')[1]
    const {user_id,project_id,status} = req.body
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        const re= await respond_join(id,user_id,project_id,status)
        if(re.error){
            return res.status(400).json(re)
        }
        res.status(200).json(re)
    }
    catch(err){
        console.error(err)
        res.status(500).json({error:'Server error'})
    }
})

module.exports= router