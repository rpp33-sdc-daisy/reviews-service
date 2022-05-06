
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

require('dotenv').config();
const port = process.env.PORT;
const app = express();

app.use(bodyParser.json());
app.use('/', routes);

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = { app, server };
