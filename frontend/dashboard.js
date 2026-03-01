
function render_person_info(data){
    const person_info=document.getElementById("person-info")
    person_info.innerHTML=`
        <div id="first">
            <h1>${data.job_name} ${data.name}</h1>
        </div>
                <div id="user">
            <h1>${data.username}</h1>
        </div>
        <div id="email">
            <h1>${data.email}</h1>
        </div>
        <div id="phone">
            <h1>${data.phone}</h1>
        </div>
        <div id="number-of-projects">
            <h1>${data.number_of_projects}</h1>
        </div>
        <button>
            <a href="#">Edit Profile</a>
        </button>
    `
}


function render_projects(projects){
    const proj=document.getElementById('projects')
    projects.forEach((p) => {
        const div=document.createElement('div')
        div.classList.add('card')
        div.innerHTML=`
            <h1>${p.name}</h1>
            <p>${p.description}</p>
            <a class="btn" href="#">View Details</a>
        `
        proj.appendChild(div)
    });
}
async function get_user_info(){
    const token = localStorage.getItem('token')
    try{
        const res = await fetch('/user', {
            method: 'GET',
            headers:{
                'Content-Type':'Application/json',
                'Authorization':`Bearer ${token}`
            },
        })
        const data = await res.json()
        return data
    }
    catch(err){
        console.error('Error fetching data:', err)
    }
}
 
async function get_user_projects(){
    const token = localStorage.getItem('token')
    try{
        const res = await fetch('/project', {
            method: 'GET',
            headers:{
                'Content-Type':'Application/json',
                'Authorization':`Bearer ${token}`
            },
        })
        const data = await res.json()
        return data
    }
    catch(err){
        console.error('Error fetching data:', err)
    }
}

function render_create_project_form(){
    const form= document.getElementById('create_project')
    form.style.display = 'block'   // يظهر الفورم
    form.innerHTML=`
        <form>
        <label for="name">project name</label>
        <input id="name" name="project name" placeholder="project name" required>

        <label for="description">project description</label>
        <input id="description" name="project description" placeholder="project description" required>
        <button type="submit" class="btn">create</button>
        </form>
    `
    create_project()
}


async function create_project(){
    const cr_proj_form = document.getElementById("create_project")
    cr_proj_form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const project_name = document.getElementById('name').value
        const description = document.getElementById('description').value
        const auth = localStorage.getItem('token')
        try{
            const res = await fetch('/project',{                      // match backend route
                method: 'POST',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${auth}`
                },
                body: JSON.stringify({project_name, des: description})
            })
            const data = await res.json()
            console.log('created', data)
        }
        catch(err){
            console.error('Error creating project:', err)
        }
    })
}
document.addEventListener('DOMContentLoaded', () => {
   (async()=>{
    const p=await get_user_projects()
    console.log(p)
    render_projects(p)
    const data = await get_user_info()
    console.log(data)
    render_person_info(data[0])
   })()
        })

        




