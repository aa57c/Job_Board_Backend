const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const passport = require("passport");


require("dotenv").config({ path: "./config.env" });

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());


app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  limit: '10mb',
  extended: true,
  parameterLimit: 50000
}));

const dbo = require("./db/connection");
const recordRoutes = require("./routes/dbCalls");



dbo.connectToServer( (err) => 
{
  if(err)
  {
    console.error(err);
    process.exit();
  }
})

app.use(passport.initialize());

require("./config/passport")(passport);

app.use(recordRoutes);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});


