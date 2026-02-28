const jwt = require('jsonwebtoken');
const router =require('express').Router()
const { create_project,get_user_projects }= require('../../db/projects.js')

router.post('/project',async(req,res)=>{
    const {project_name,des}=req.body
    const auth = req.headers.authorization || ''
    // Token should be prefixed with Bearer
    const token = auth.split(' ')[1]
    try{
        const payload = jwt.verify(token,process.env.JWT_SECRET)
        const data = await create_project(payload.id, project_name, des)
        res.status(201).json(data)
    }
    catch(err){
        res.status(500).json({error:err.message})
        console.error(err.stack)
    }
})



router.get('/project',async (req, res)=>{
    const auth= req.headers.authorization || ''
    const token = auth.split(' ')[1]
    try{
        const payload = jwt.verify(token,process.env.JWT_SECRET)
        const data = await get_user_projects(payload.id)
        res.status(200).json(data)
    }
    catch(err){
        res.status(500).json({error: err.message})
        console.error(err.stack)
    }
})
module.exports= router