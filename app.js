const express = require("express");
const app = express();
const port = 3000;


var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

app.use(express.static(__dirname + "/public"))
app.use(require("./controllers"))

app.listen(3000, () => {
  console.log(`App is running on port: ${port}`)
});