require('dotenv').config()

var express = require("express");
var cors = require("cors")
var app = express();
app.use(express.json());
app.use(cors())

const jwt = require('jsonwebtoken')

var UserController = require("./controllers/UserController")
var PacientController = require("./controllers/PacientController")
var MysqlClient = require("./database/MysqlClient")

var port = process.argv.slice(2)[0];

if (isNaN(port)) {
    throw new Error("Please provide a port for the application")
}

mysqlClient = new MysqlClient();
mysqlClient.connect()
userController = new UserController(mysqlClient)
pacientController = new PacientController(mysqlClient)

app.post("/create/user", (req, res, next) => {
    userController.create(req.body.user).then(message => {
        res.status(message.statusCode).send(message)
    })
});


app.post("/authenticate", (req, res) => {
    userController.authenticate(req.body.user).then(message => {
        if (message.statusCode === 200) {
            message.accessToken = jwt.sign(req.body.user, process.env.ACCESS_TOKEN_SECRET)
        }

        res.status(message.statusCode).send(message)
    })
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        req.user = user
        next()
    })
}

app.post("/create/pacient", authenticateToken, (req, res) => {
    pacientController.create(req.user, req.body.pacient).then(message => {
        res.status(message.statusCode).send(message)
    })
});


app.get("/pacient/:cpf", (req, res) => {
    pacientController.find(req.param("cpf")).then(result => {
        res.status(result.status).send(result.pacient)
    })
});

app.post("/pacient/list", (req, res) => {
    pacientController.list(req.list).then(pacients => {
        res.send(pacients)
    })
});

app.listen(port, () => {
 console.log("Server running on port " + port);
});