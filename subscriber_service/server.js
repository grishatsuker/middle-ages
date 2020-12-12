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

app.get('/email_list', (req, res) => {
  res.send('Here is the email list : ');
});


app.listen(process.env.PORT || PORT, HOST, ()=>{
  console.log('Server is running on http://${HOST}:${PORT}');
});

module.exports = app;