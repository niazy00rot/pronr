const router = require('express').Router()
const jwt = require('jsonwebtoken')
const {get_user_data} = require('../../db/user.js')

router.get('/user', async (req,res)=>{
    const auth = req.headers.authorization
    if (!auth || !auth.includes(' ')) {
        return res.status(401).json({error: "Missing or invalid authorization header"})
    }
    const token = auth.split(' ')[1] 
    try{
        const id = jwt.verify(token,process.env.JWT_SECRET).id
        const data = await get_user_data(id.id)
        return res.status(200).json(data)
    }
    catch(err){
        res.status(500).json({error: err.message})
        console.error(err.stack)
    }
})

module.exports= router