const router = require('express').router();
const jwt = require('jsonwebtoken');
const {register,login}= require('../../db/index')

router.post('/login', async (req,res)=>{
    const {username,password} = req.body
    const id = await login(username, password)
    
    if(id){
        const token =jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1h'})
        res.status(200).json({token})
    }
    else{
        res.status(401).json({message: 'Invalid username or password'})

    }
})






router.post('/register',async (req,res)=>{ 
    const {username,password,name,job_name,email, phone} = req.body
    const id = await register(username,password,name,job_name,email, phone)
    if(id){ 
        res.status(201).json({message: 'User registered successfully'})
    }
  else{
    res.status(401).json({message: 'Registration failed'})
  }
 })

 module.exports = router;
 