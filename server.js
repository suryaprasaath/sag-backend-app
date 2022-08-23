const express = require("express")
const app = express()
const mysql = require("mysql")
require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
app.use(function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Credentials',true);
   res.header('Access-Control-Allow-Headers', '*');
   res.header('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
   next();
});
const db = mysql.createPool({
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT
})
db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connected successful")
})
const port = process.env.PORT

const bcrypt = require("bcrypt")
app.use(express.json())



app.post("/createUser", async (req,res) => {
const user = req.body.name;
const password = req.body.password
const email =req.body.email
const phoneno =req.body.phoneno
const hashedPassword = await bcrypt.hash(password,10);
db.getConnection( async (err, connection) => {
 if (err) throw (err)
 const sqlSearch = "SELECT * FROM userTable WHERE user = ?"
 const search_query = mysql.format(sqlSearch,[user])
 const sqlInsert = "INSERT INTO userTable VALUES (0,?,?,?,?)"
 const insert_query = mysql.format(sqlInsert,[user, hashedPassword,email,phoneno])
 await connection.query (search_query, async (err, result) => {
  if (err) throw (err)
  console.log("------> Search Results")
  console.log(result.length)
  if (result.length != 0) {
   connection.release()
   console.log("------> User already exists")
   res.send({"message":"already-exists"}); 
  } 
  else {
   await connection.query (insert_query, (err, result)=> {
   connection.release()
   if (err) throw (err)
   console.log ("--------> Created new User")
   console.log(result.insertId)
   res.send({"message":"User-created"});
  })
 }
}) 
}) 
}) 

app.post("/login", (req, res)=> {
    const user = req.body.name
    const password = req.body.password
    console.log(user)
    console.log(password)
    db.getConnection ( async (err, connection)=> {
     if (err) throw (err)
     const sqlSearch = "Select * from userTable where user = ?"
     const search_query = mysql.format(sqlSearch,[user])
     await connection.query (search_query, async (err, result) => {
      connection.release()
      
      if (err) throw (err)
      if (result.length == 0) {
       console.log("--------> User does not exist")
       res.send({"message":"notfound"});
      } 
      else {
         const hashedPassword = result[0].password
         //get the hashedPassword from result
        if (await bcrypt.compare(password, hashedPassword)) {
        console.log("---------> Login Successful")
        res.send({"message":"positive"});
        } 
        else {
        console.log("---------> Password Incorrect")
        res.send({"message":"negative"});
        } 
      }
     }) 
    }) 
    }) 
    
app.listen(port, 
    ()=> console.log(`Server Started on port ${port}...`))