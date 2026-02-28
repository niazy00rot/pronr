const pool = require('./init_db')

async function create_user_table(){
    const client=await pool.connect()
    try{
       await pool.query(`create table if not exists users (
        id serial primary key,
         username varchar(50) unique not null,
         password varchar(50) not null,
         name varchar(50) not null,
         email varchar(50) not null,
         phone varchar(50) not null ,
         job_name varchar(50) not null) 
         `)
         await pool.query(`create table if not exists projects(
            id serial primary key ,
            name varchar(50) not null ,
            owner_id int not null,
            description TEXT , foreign key (owner_id) references users(id) 
            )`)


         await pool .query(`create table if not exists project_member(
            proj_id int not null ,foreign key (proj_id) references projects(id),
            user_id int not null , foreign key (user_id) references users(id),
            user_role varchar(50) not null
            )`)

            await pool.query(`create table if not exists groups(
            group_id serial primary key,
            m1_id int not null ,foreign key (m1_id) references users(id),
            m2_id int not null ,foreign key (m2_id) references users(id),
            m3_id int not null ,foreign key (m3_id) references users(id),
            m4_id int not null ,foreign key (m4_id) references users(id),
            m5_id int not null ,foreign key (m5_id) references users(id)
            )`)


         await pool.query(`create table if not exists tasks (
            id serial primary key,
            title varchar(50) not null,
            project_id int not null,foreign key (project_id) references projects(id),
            description text,
            satus varchar(20) not null,
            group_id int not null ,foreign key (group_id) references groups(group_id)
            )`)
            
         
            
        await pool.query(`create table if not exists join_req(
            user_id int not null , foreign key (user_id) references users(id),
            pro_id int not null ,foreign key (pro_id) references projects(id),
            status varchar(20) not null
            )`)
        
        await pool.query(`
            create table if not exists add_req(
            user_id int not null , foreign key (user_id) references users(id),
            pro_id int not null ,foreign key (pro_id) references projects(id),
            status varchar(20) not null
            )`)
        await pool.query(
    `ALTER TABLE projects
    ADD COLUMN description TEXT;`
)
        console.log('Tables created successfully')

    }
    catch(err){
        console.error('Error creating users table',err)
    }
    finally{
        client.release()
    }
}
// create_user_table()
