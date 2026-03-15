const router = require('express').Router()
const {get_project_tasks,add_task,get_task_members,delete_task,add_member,delete_task, get_project_owner, delete_member } = require('../../db/tasks')
const jwt = require('jsonwebtoken')

//add task 
router.get('/tasks', async (req,res)=>{
    const project_id = req.query.id
    const auth = req.headers.authorization
    const token = auth.split(' ')[1]
    try{
        const owner_id = await get_project_owner(project_id)
        const id = jwt.verify(tpken,process.env.JWT_SECRET).id.id
        const tasks= await get_project_tasks(project_id)
        console.log(tasks)
        res.status(200).json(tasks)
    }
    catch(err){
        console.error(err)
        res.status(500).json
    }
})

router.post('/tasks', async (req,res)=>{
    const project_id = req.query.id
    const {name, description} = req.body
    const auth =req.headers.authorization 
    
    const token = auth.split('')[1]
    try{
        const owner_id = await get_project_owner(project_id)
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        if(owner_id == id){
            const t_id= await add_task(name, description, project_id)
            console.log(id)
            res.status(201).json(t_id)
        }
        else{
            res.status(300).json({'massege':'U are not owner'})
        }
    }
    catch(err){
        console.error(err)
        res.status(500).json
    }
})


router.delete('/tasks', async (req,res)=>{
    const project_id = req.query.id
    const {task_id} = req.body
    const auth =req.headers.authorization 
    const token = auth.split('')[1]
    try{
        const owner_id = await get_project_owner(project_id)
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        if(owner_id == id){
            await delete_task(task_id)
            res.status(202)
        }
        else{
            res.status(300).json({'massege':'U are not owner'})
        }
    }
    catch(err){
        console.error(err)
        res.status(500).json
    }
})


router.put('/tasks',async(req,res)=>{
    const project_id = req.query.id
    const {task_id, status}= req.body
    const auth = req.headers.authorization
    const token = auth.split('')[1]
    try{
        const owner_id =await get_project_owner(project_id)
        const id =jwt.verify(token,process.env.JWT_SECRET).id.id
        if(owner_id==id){
            const data  = await update_status(task_id, status)
            return res.status(200).json(data)
        }
        else{
            return res.status(300)
        }
    }
    catch(err){
        console.error(err)
        res.status(500).json({'massege':'U are not owner'})
    }
})

router.get('/members', async(req,res)=>{
    const auth = req.headers.authorization
    const token = auth.split('')[1]
    const task_id = req.query.task_id
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id.id
        const members= await get_task_members(task_id)
        res.status(200).json(members)
    }
    catch(err){
        console.error(err)
        res.status(500).json
    }
})

router.delete('/member', async (req,res)=>{
    const auth = req.headers.authorization
    const token = auth.split('')[1]
    const {task_id,member_id} = req.body
    try{
        const owner_id =await get_project_owner(project_id)
        const id =jwt.verify(token,process.env.JWT_SECRET).id.id
        if(owner_id==id){
            const data  = await delete_member(task_id, member_id)
            return res.status(200).json(data)
        }
        else{
            return res.status(300)
        }
    }
    catch(err){
        console.error(err)
        res.status(500).json({'massege':'U are not owner'})
    }
})





