require("dotenv").config()
const app = require('./src/app')
const connectToDb = require('./src/config/database')






connectToDb()




app.listen(5000,()=>{
    console.log("server is running on port 5000");
})