const express = require("express");
const cors = require("cors");
const path = require('path');
const port = 8080;
const app = express();

app.use(cors({
  origin: ["http://localhost:3001", "http://localhost:3000"]
}));

app.use(express.static(path.join(__dirname, 'frontend/build')));

app.listen(port, () => console.log(`port: ${port}`));

// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

require("./routes")(app);

// require("./models").sequelize.sync();

// require("./models").sequelize
//   .sync({ force: true })
//   .then(() => {
//     console.log("Drop and re-sync db.");
//   });