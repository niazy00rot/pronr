function showRegister(){
    document.getElementById('login_form').classList.add('hidden')
    document.getElementById('register_form').classList.remove('hidden')
}
function showLogin(){
    document.getElementById('login_form').classList.remove('hidden')
    document.getElementById('register_form').classList.add('hidden')
}


const login_form = document.getElementById("login-form")
const register_form = document.getElementById("register-form")
login_form.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const username = document.getElementById('login-username').value
    const password = document.getElementById('login-password').value
    try{
        const res= await fetch('/login',{
            'method': 'POST',
            'headers':{
                'Content-Type': 'application/json'
            },
            'body': JSON.stringify({username,password})
        })
        const data= await res.json()
        if(res.ok){
            localStorage.setItem('token',data.token)
            window.location.href = 'stage.html'
        }
        else{
            alert('wrong username or password')
        }
    }
    catch(err){
        alert(err.message)
    }
    
})



register_form.addEventListener('submit', async(e)=>{
    e.preventDefault()
    const username = document.getElementById('register-username').value
    const password = document.getElementById('register-pass').value
    const confirm_password = document.getElementById('register-confirm').value
    const email = document.getElementById('register-email').value
    const name = document.getElementById('register-name').value
    const phone = document.getElementById('register-phone').value
    const job_name = document.getElementById('register-job').value
    if(password !== confirm_password){
        alert("passords donot match")
        return
    }
    try{
        const res = await fetch('/register',{
             'method':'POST',
                'headers':{
                    'Content-Type':'application/json'
                },
                'body': JSON.stringify({username,password,email,name,phone,job_name})
        })
        const data = await res.json()
        if(res.ok){
            alert("registeraton successfully")
        }
    }
    catch(err){
        alert(err.message)
    }
})