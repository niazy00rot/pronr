function render_person_info(data){
    const person_info=document.getElementById("person-info")
    person_info.innerHTML=`
        <div id="first">
            <h1>Job Name + Ahmed</h1>
        </div>
                <div id="user">
            <h1>User</h1>
        </div>
        <div id="email">
            <h1>ahmed@email.com</h1>
        </div>
        <div id="phone">
            <h1>+201092688458</h1>
        </div>
        <div id="number-of-projects">
            <h1>15 Projects</h1>
        </div>
        <button>
            <a href="#">Edit Profile</a>
        </button>
    `
}
let data=2;
document.addEventListener('DOMContentLoaded', () => {
    render_person_info(data)
        })





