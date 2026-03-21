const pool = require('./init_db')
const {get_id_by_username} =require('./helper.js')


async function send_invite(owner_id, username, project_id){
    const client= await pool.connect()
    try{
        const user= await client.query(`select id from users where username =$1`, [username])
        if(user.rows.length===0){
            return{error:'user not found'}
        }
        const id = user.rows[0].id

        const project = await client.query(`select id from projects where id=$1 and owner_id = $2`, [project_id,owner_id])

        if(project.rows.length===0){
            return {error: `not your project`}
        }

        await client.query(`insert into 
            add_req (user_id,pro_id,status) 
            values ($1,$2,'waiting')`,[id,project_id])
        return{sccess:true}
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}


async function get_user_invites(id){
    const client= await pool.connect()
    try{
        const projects= await client.query(`select add_req.pro_id, projects.name, projects.description 
            from add_req
            join projects on add_req.pro_id = projects.id
            where user_id = $1 and status = 'waiting'`,[id])
        return projects.rows
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}



async function respond_invite(user_id, project_id, status){
    const client= await pool.connect()
    try{
        await client.query(`update add_req 
            set status = $1 where 
            user_id = $2 and pro_id = $3`,[status, user_id, project_id])

        if (status === 'accepted'){
            await client.query(`insert into project_member(proj_id,user_id,user_role) 
                values ($1,$2,'member')`,[project_id,user_id])
        }
        return {success: true}
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}




async function send_join(user_id, project_id)
{
    const client= await pool.connect()
    try{
        const e= await client.query(`select * from join_req where
            pro_id=$1 and user_id=$2`,[project_id,user_id])
        if (e.rows.length>0){
            return {error:'Request already sent'}
        }


        client.query(`insert into join_req(user_id,pro_id,status)
            values($1,$2,'waiting')`,[user_id,project_id])
        return {success:true}
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}


async function get_join(user_id,project_id){
    const client= await pool.connect()
    try{
        const re = await client.query(`select owner_id from projects where id=$1 and owner_id= $2`,[project_id,user_id])
        if(re.rows.length===0){
            return {error:'Not your project'}
        }
        const requists= await client.query(`select join_req.user_id, users.name, users.username
            from join_req
            join users on join_req.user_id = users.id
            where  join_req.pro_id = $1 and status = 'waiting'`,[project_id])
        
        return requists.rows
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}


async function respond_join(owner,user_id, project_id, status){
    const client= await pool.connect()
    try{
        const re = await client.query(`select owner_id from projects where id=$1 and owner_id= $2`,[project_id,owner])
        if(re.rows.length===0){
            return {error:'Not your project'}
        }
        await client.query(`update join_req 
            set status = $1 where 
            user_id = $2 and pro_id = $3`,[status, user_id, project_id])

        if (status === 'accepted'){
            await client.query(`insert into project_member(proj_id,user_id,user_role) 
                values ($1,$2,'member')`,[project_id,user_id])
        }
        return {success:true}
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}

module.exports={send_invite,get_user_invites,respond_invite,send_join,get_join,respond_join}
