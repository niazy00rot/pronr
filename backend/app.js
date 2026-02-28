const express = require('express');
const path = require('path')
const app = express();
const cors = require('cors')
const index_router = require('./routers/index.js')
const root_router= require('./routers/root.js')
const user_router= require('./routers/user.js')
const db= require('../db/create_db.js') // Ensure database tables are created on server start;
const port = 3001

// Parse JSON bodies before routes
app.use(express.json())
app.use(cors())

// Serve frontend static files (use absolute path)
app.use(express.static(path.join(__dirname, '..', 'frontend')))

// API and root routes
app.use('/', index_router)
app.use('/', root_router)
app.use('/', user_router)

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})