// projects module should use the database pool directly
const pool = require('./init_db')

 
async function create_project(user_id,name,des){
    const client = await pool.connect()
    try{
        const res = await client.query(`
            insert into projects (name,description,owner_id)values($1,$2,$3) returning id`,
            [name, des, user_id.id])
        await client.query(`
            insert into project_member(proj_id,user_id,user_role)values($1,$2,$3)`,
            [res.rows[0].id, user_id.id, 'owner'])
        return res
    }
    catch(err){
        console.error(err)
    }
    finally {
        client.release()
    }
}

async function get_user_projects(user_id){
    const client= await pool.connect()
    try{
        const res = await client.query(
            `select 
                p.id,
                p.name,
                p.description,
                project_member.user_id
            from projects p 
            JOIN project_member 
                ON p.id = project_member.proj_id
            where project_member.user_id = $1`,
            [user_id.id]
        )
        return res.rows
    }
    catch(err){
        console.error(err)
        throw err
    }
    finally{
        client.release()
    }
}

module.exports={create_project,get_user_projects}



