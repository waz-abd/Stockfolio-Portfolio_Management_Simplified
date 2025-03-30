// MariaDB connection pool
//const pool = mariadb.createPool({
  //  host: "localhost",
    //user: "admin",
   // password: "Binoo-143",
   // database: "stockfoliodb",
   // connectionLimit: 5
//});

// API Endpoint to insert user data
const express = require("express");
const mariadb = require("mariadb");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());  // Enable CORS for frontend communication
app.use(bodyParser.json());

// MariaDB Connection Pool
const pool = mariadb.createPool({
    host: "127.0.0.1",   // Change to your MariaDB server IP if remote
    user: "admin",
    password: "Binoo-143",
    database: "stockfoliodb",
    connectionLimit: 10,
acquireTimeout: 20000 
});

// API Route to Insert Data into MariaDB
app.post("/register", async (req, res) => {
const users = req.body; // Extract the array from request body
//console.log(users);
const username = users.username;
    const password = users.password;
   const firstname = users.firstname;
    const lastname = users.lastname;
    const email = users.email;
const today = new Date();
const date=today.toISOString().split("T")[0];

  let conn;
  try {
    conn = await pool.getConnection();
console.log("con");       
await conn.query("INSERT INTO user (first_name, last_name, email, username, password, account_date ) VALUES (?, ?, ?, ?, ?, ?)", [firstname, lastname, email, username, password, date]);
       res.send("User registered successfully!");
} catch (err) {
 res.status(500).send("Error: " + err.message);
 } finally {
 if (conn) conn.release();
 }
//code to test connection only
 // let conn;
   //   try {
     //   conn = await pool.getConnection();
       // console.log("connected ! connection id is " + conn.threadId);
       // await conn.release(); //release to pool
     // } catch (err) {
       // console.log("not connected due to error: " + err);
     // }
//code to test connection ends here

});


app.get('/api/data/:username', async (req, res) => {
  let conn;
  const username = req.params.username; // Get username from URL
console.log("inside get with username" + username);
  try {
    conn = await pool.getConnection();
    const rows = await conn.query('SELECT * FROM user WHERE username = ?', [username]);

    if (rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json(rows[0]); // Return the first matching user
    }
  } catch (err) {
    res.status(500).send(err.toString());
  } finally {
    if (conn) conn.release();
  }
});









// Start the Server
app.listen(3000, () => {
    console.log("Server running on http://0.0.0.0:3000");
});
