const pool = require('./init_db')

async function get_user_data(id){
    const client=await pool.connect()
    try{
        const data = await client.query(`
            SELECT 
                u.id,
                u.username,
                u.name,
                u.email,
                u.phone,
                u.job_name,
                COUNT(project_member.proj_id) AS number_of_projects
            FROM users u
            LEFT JOIN project_member
                ON project_member.user_id = u.id
            WHERE u.id = $1
            GROUP BY u.id
        `, [id]) 
        return data.rows
            
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}


module.exports= {get_user_data}
