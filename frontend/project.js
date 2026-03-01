function getProjectId(){
    const params = new URLSearchParams(window.location.search)
    return params.get('id')
}
async function get_project_by_id(){
    const id = getProjectId()
    try{
        const token = localStorage.getItem('token')
        const res= await fetch(`/project?id=${id}`,{
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        const data = await res.json();
        return data;
    }
    catch(err){
       console.error('Error fetching data:', err);
        
    }
    
}

async function render_project_data(data){
    const nav_bar = document.getElementById("nav-bar")
    nav_bar.innerHTML=`
        <h1>${data[0].name}</h1>
        <p>${data[0].description}</p>
        <button>Back</button>
    `
}




document.addEventListener('DOMContentLoaded', () => {
   (async()=>{
    const data = await get_project_by_id()
    console.log(data)
    render_project_data(data)
   })()
        })

