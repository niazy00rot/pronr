const express = require('express');
const app = express();
const index_router = require('./routers/index.js')
app.use('/', index_router)
app.use(express.json())