const pool = require('./init_db')

async function get_project_tasks(project_id){
  const client =await pool.connect()
   try{
    const res =await client.query(
        `select * from tasks  where project_id =$1`,[project_id]
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

async function add_task(title, description, project_id) {
    const client = await pool.connect()
    try{
        const res = await client.query(`insert into tasks (title,description,project_id,satus) values ($1,$2,$3,'pending') returning id `,[title,description,project_id])
        return res.rows[0].id
    }
    catch(err){
        console.error(err)       
         throw err
    }
    finally{
        client.release()
    }
}


async function delete_task(id){
    const client= await pool.connect()
    try{
        await client.query(`delete from tasks where id = ${id}`)
    }
    catch(err){
        console.error(err)
    }
    finally{
        await client.release()
    }

}


async function get_task_members(task_id){
    const client= await pool.connect()
    try{
        const res = await client.query(`select member_id from task_members where task_id= $1`,[task_id]).rows
        console.log(res)
        const m =[]
        res.forEach(x => {
            const data=client.query(`select id,name,job_name from users where id = $1`,[x]).rows[0]
            console.log(data)
            m.push(data)
        });
        return data
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}

async function add_member(task_id,member_id){
    const client= await pool.connect()
    try{
        const res = await client.query(`insert into task_members(task_id,member_id) values ($1,$2) returning id `,[task_id,member_id] )
        return res.rows[0].id
    }
    catch(err){
    console.error(err)
    }
    finally{
        client.release()
    }
}

async function delete_member(task_id,member_id){
    const client= await pool.connect()
    try{
        const res= await client.query(`delete from task_members where task_id=${task_id} and member_id=${member_id}`)
        return res.rowCount[0]
    }

    catch(err){
       console.error(err)
    }

    finally{
        client.release()
    }
}

async function update_status(task_id , status){
    const client= await pool.connect()
    try{
        const result= await client.query('update tasks set satus= $1 where id=$2 returning *',[status,task_id])
        return result.rows[0]
    }

    catch(err){
        console.error(err)
    }

    finally{
        client.release()
    }
}


async function get_project_owner(pro_id){
    const client =await pool.connect()
    try{
        const id = await client.query(`select owner_id from projects where id = $1`,[pro_id])
        return id.rows[0].owner_id
    }
    catch(err){
        console.error(err)
    }
    finally{
        client.release()
    }
}

module.exports = { get_project_tasks, add_task, get_project_owner, delete_task , get_task_members, add_member, delete_member, update_status}