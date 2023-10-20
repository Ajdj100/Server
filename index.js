const express = require('express');
const db = require('mysql2');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');

var con = db.createConnection({
    host: "localhost",
    user: "root",
    password: "Thataj100!",
    database: "shoutbox"
});

// token stuff
dotenv.config();
process.env.TOKEN_SECRET;

function genToken(username) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '30s' })
}

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err);

        if (err) return res.sendStatus(403);

        req.user = user;

        next();
    });
};


con.connect(function (err) {
    if (err) throw (err);
    console.log("connected");
})

const app = express();

app.use(express.json());
app.use(cors());


//ROUTES

app.get('/', (req, res) => {
    console.log("request");
    res.status(200).json({ message: "Hello from my-express-app!" });
});

//create an account
app.post('/register', (req, res) => {
    console.log("create account");
    var sql = `INSERT INTO users (Username, DisplayName, Password) 
    VALUES ('${req.body.Username}', '${req.body.DisplayName}', '${req.body.Password}');`
    con.query(sql, function (err, result) {
        if (err) throw (err);
        console.log("user created");
        res.status(201);
    });
});

//log in
app.post('/login', (req, res) => {

    var sql = `SELECT * FROM users WHERE Username='${req.body.Username}' AND Password='${req.body.Password}'`
    con.query(sql, function (err, result) {
        if (err) throw (err)

        if (result.length == 1) {
            console.log("good");
            const newToken = genToken({ username: req.body.Username });
            res.status(200).json({ 'token': newToken });
        } else {
            console.log("bad");
            res.status(401);
        }

    })
    res.status();
})

app.get('/users', authToken, (req, res) => {
    var sql = `SELECT * FROM users`;
    con.query(sql, function (err, result) {
        if (err) throw (err);

        res.json(result);
        res.status(200);
    })
})

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
});