const path = require('path')
require('dotenv').config({ 
    path: path.resolve(__dirname, 'dev.env'),
    override: true
})
const {Pool} = require('pg')

const pool = new Pool({
    user: process.env.username,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
})
module.exports = pool
