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


document.addEventListener('DOMContentLoaded', () => {
   (async()=>{
    const data = await get_user_info()
    console.log(data)
    render_person_info(data[0])
   })()
        })





