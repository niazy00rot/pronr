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

async function get_project_by_id(id){
    const client = await pool.connect()
    try{
        const data = await client.query(`
            Select id,name,description,owner_id
            from projects
            where id=$1
        `,[id])
        return data.rows
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release();
    }
}

async function get_project_data_by_name(project_name,user_id) {
    const client = await pool.connect()
    try{
        const data = await client.query(`
            SELECT 
                projects.id, 
                projects.name, 
                projects.description,
                CASE 
                    WHEN join_req.status = 'waiting' THEN 'pending'
                    WHEN pm.user_id IS NOT NULL THEN 'member'
                    ELSE 'none'
                END as request_status
            FROM projects
            LEFT JOIN join_req 
                ON join_req.pro_id = projects.id AND join_req.user_id = $2
            LEFT JOIN project_member pm 
                ON pm.proj_id = projects.id AND pm.user_id = $2
            WHERE projects.name = $1`,[project_name,user_id])
        if(data.rows.length===0){
            return{error:'Project not founed'}
        }
        return data.rows
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release();
    }
}

module.exports={create_project,get_user_projects,get_project_by_id,get_project_data_by_name}



