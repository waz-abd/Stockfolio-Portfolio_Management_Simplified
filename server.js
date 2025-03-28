//console.log(username1);
//console.log(firstname2);
  
  let conn;
  try {
//console.log("beforecon");
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

// Start the Server
app.listen(3000, () => {
    console.log("Server running on http://0.0.0.0:3000");
});
