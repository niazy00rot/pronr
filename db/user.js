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

async function get_user_projects(id){
    const client =await pool.connect()
    try{
        const data = await client.query(`
           select 
           p.id,
           p.name,
           p.description,
           project_member.user_id
           from projects p 
           JOIN project_member 
           ON P.ID =project_member.proj_id
           where project_member.user_id =${id}

            `)
            return data
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}
console.log(get_user_projects(1))
module.exports= {get_user_data,get_user_projects}
