const pool = require('./init_db')

async function register(username,password,name,job_name,email, phone){
    const client= await pool.connect()
    try{
        const res=await client.query(`insert into users (
            username,password,name,job_name,email,phone) values ($1,$2,$3,$4,$5,$6) returning id`,[username,password,name,job_name,email,phone])
        return res.rows[0].id
    }
    catch(err){
        console.error('Error registering user:', err)
    }
    finally{
        client.release()
    }
}






async function login(username,password){
    const client= await pool.connect()
    try{
        const res = await pool.query(`select id from users where username='${username}' and password='${password}'`)
        return res.rows[0]
    }
    catch(err){
        console.error('Error logging in user:', err)
    }
    finally{
        client.release()
    }
}