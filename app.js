var express = require("express");
var app = express();
app.use(express.json());

var UserController = require("./controllers/UserController")
var MysqlClient = require("./database/MysqlClient")

var port = process.argv.slice(2)[0];

if (isNaN(port)) {
    throw new Error("Please provide a port for the application")
}

mysqlClient = new MysqlClient();
mysqlClient.connect()
userController = new UserController(mysqlClient)

app.post("/create/user", (req, res, next) => {
    status = userController.create(req.body.user)
    res.status(status)
});

/*
app.post("/authenticate", (req, res) => {
    user = userSerializer.parse(req.body)
    res.json(authController.authenticate(user))
});


app.post("/create/pacient", (req, res) => {
    pacient = pacientBuilder.build(req.body)
    res.json(pacientController.create(pacient))
});

app.get("/pacient/:cpf", (req, res) => {
    res.json(pacientController.find(req.param("cpf")));
});

app.post("/pacient/list", (req, res) => {
    list = listBuilder.build(req.body)
    res.json(pacientController.list(list))
});
*/

app.listen(port, () => {
 console.log("Server running on port " + port);
});