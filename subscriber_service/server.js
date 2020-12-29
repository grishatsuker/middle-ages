'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  res.send('Hello World');
});
num_gets = 0
app.get('/count', (req, res) => {
  num_gets += 1
  res.send('Count is  ${num_gets}');
  console.log("Count is now ${num_gets}")
});


app.listen(process.env.PORT || PORT, HOST, ()=>{
  console.log('Server is running on http://${HOST}:${PORT}');
  console.log("hi")
});

module.exports = app;