var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("view engine", "ejs");
app.use(cookieParser());

// GENERATING A RANDOM STRING FOR A SHORT URL
function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

// URL DATABASE - KEY = SHORT URL : VALUE = LONG URL
const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

// USERS DATABASE - KEYS (ID, EMAIL, PASSWORD) : VALUES "xyzIdEmailPassword"
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// GET REGISTRATION PAGE FROM SERVER TO BROWSER
app.get("/register", (req, res) => {
    res.render("urls_register");
});

//  POST REGISTRATION INFORMATIONS FROM BROWSER TO SERVER
app.post("/register", (req, res) => {
    let id = generateRandomString();
    users[id] = {
        id: id,
        email: req.body.email,
        password: req.body.password
    };
    console.log(users);
    res.cookie("id", id);
    res.redirect("/urls");
});

// POST THE USERNAME WITH COOKIES for LOGGING IN
app.post("/login", (req, res) => {
    res.cookie("username", req.body.username)
    res.redirect("/urls");
});

// CLEAR THE COOKIES WHEN LOGGING OUT
app.post("/logout", (req, res) => {
    res.clearCookie("username")
    res.redirect("/urls");
});

// HOME PAGE - HELLO
app.get("/", (req, res) => {
    res.end("Hello!");
});

// DATABASE WITH JSON
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

// HELLO WORLD PAGE
app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// DATABASE FORMATTED WITH EJS
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
});

// URLS NEW ENTRY PAGE FOR USER
app.get("/urls/new", (req, res) => {
    let templateVars = {
        username: req.cookies["username"]
    };
    res.render("urls_new", templateVars);
});

// POST THE NEW GENERATED SHORT URL - LONG URL IN THE DATABASE (UPDATE THE DB)
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});

// PAGE SHOWING THE SINGLE URL AND LONG URL
app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    let longURL = urlDatabase[shortURL];
    let templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        username: req.cookies["username"]
    };
    res.render("urls_show", templateVars);
});

// POST THE URL UPDDATED AFTER EDITING
app.post("/urls/:id", (req, res) => {
    let shortURL = req.params.id
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});

// PAGE TO THE LONG URL
app.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL];
    if (longURL === undefined) {
        res.status(404).send("Not Found");
    } else {
        res.redirect(301, longURL);
    }
});

// DELETE URL
app.post("/urls/:id/delete", (req, res) => {
    let shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});

// APP LISTENING TO PORT
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});


