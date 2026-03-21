const pool = require('./init_db')

async function get_id_by_username(username){
    const client= await pool.connect()
    try{
        const id = (await client.query(`select id from users where username = $1`,[username])).rows[0].id
        return id
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}

module.exports={get_id_by_username}