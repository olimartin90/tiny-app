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


// URL DATABASE - KEY = SHORT URL : VALUE = LONG URL
const urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userId: "userRandomID"
    },
    "9sm5xK": {
        longURL: "http://www.google.com",
        userId: "user2RandomID"
    }
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
    },
    "123userRandomAbcID": {
        id: "123userRandomAbcId",
        email: "olifear@hotmail.com",
        password: "1q2w3e"
    }
};

console.log(users);


function filterUrls(userId) {
    const urlDatabaseFiltered = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userId === userId) {
            urlDatabaseFiltered[shortURL] = urlDatabase[shortURL]
        }
    }
    return urlDatabaseFiltered;
};


// GET REGISTRATION PAGE FROM SERVER TO BROWSER
app.get("/register", (req, res) => {
    res.render("urls_register");
});

//  POST REGISTRATION INFORMATIONS FROM BROWSER TO SERVER
app.post("/register", (req, res) => {
    EmailRegistration(req, res);
    res.redirect("/urls");
});


// GET LOGIN PAGE FROM SERVER TO BROWSER
app.get("/login", (req, res) => {
    res.render("urls_login")
});


// extract the info from login form
// authenticate the user with email and pwd
// if the user is authentified set the cookie
// then redirect to /urls


// POST THE EMAIL WITH COOKIES for LOGGING IN
app.post("/login", (req, res) => {
    var emailLogin = req.body.email;
    console.log("emailLogiiinn:", emailLogin);
    var passwordLogin = req.body.password;
    console.log("passwordLogin..:", passwordLogin);
    var userAuthenticated = false;
    for (var userId in users) {
        if (emailLogin === users[userId].email && passwordLogin === users[userId].password) {
            res.cookie("user_id", userId);
            userAuthenticated = true;
        }
    }
    if (!userAuthenticated) {
        res.send(403);
    } else {
        res.redirect("/urls");
    }
});


// CLEAR THE COOKIES WHEN LOGGING OUT
app.post("/logout", (req, res) => {
    res.clearCookie("user_id")
    res.redirect("/");
});


function authUser(req, res) {
    var emailLogin = req.body.email;
    console.log("emailLogiiinn:", emailLogin);
    var passwordLogin = req.body.password;
    console.log("passwordLogin..:", passwordLogin);
    var emailFound = false;
    // var userLoginId = "";
    for (var userEmailLogin in users) {
        console.log("userEmailLogin...:", userEmailLogin);
        if (emailLogin === users[userEmailLogin].email && passwordLogin === users[userEmailLogin].password) {
            users.id = users[userEmailLogin].id;
            console.log("PrintID..:", users.id);
            res.cookie("user_id", users.id);
            emailFound = true;
        } else {
            res.send(403);
        }
    }
};


// FUNCTION TO VERIFY AND THEN REGISTER EMAIL
function EmailRegistration(req, res) {
    var id = generateRandomString();
    var emailEntry = req.body.email;
    var passwordEntry = req.body.password;
    if (!emailEntry || !passwordEntry) {
        res.send(400);
    }
    if (emailEntry.length) {
        var emailExist = false;
        for (var userKey in users) {
            // console.log(users[userKey].email);
            if (emailEntry === users[userKey].email) {
                emailExist = true;
            }
        }
        if (emailExist) {
            res.send(400);
        } else {
            users[id] = {
                id: id,
                email: req.body.email,
                password: req.body.password
            }
            console.log(id);
            res.cookie("user_id", id);
            console.log(users);
        }
    }
};


// HOME PAGE - HELLO
app.get("/", (req, res) => {
    res.end("Good Bye!");
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
    var templateVars = {
        urls: filterUrls(req.cookies["user_id"]),
        user: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
});

// URLS NEW ENTRY PAGE FOR USER
app.get("/urls/new", (req, res) => {
    var templateVars = {
        user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
});

// POST THE NEW GENERATED SHORT URL - LONG URL IN THE DATABASE (UPDATE THE DB)
app.post("/urls", (req, res) => {
    var shortURL = generateRandomString();
    var longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect("/urls");
});

// PAGE SHOWING THE SINGLE URL AND LONG URL
app.get("/urls/:id", (req, res) => {
    var shortURL = req.params.id;
    var longURL = urlDatabase[shortURL];
    var templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
});

// POST THE URL UPDDATED AFTER EDITING
app.post("/urls/:id", (req, res) => {
    var shortURL = req.params.id
    var longURL = req.body.longURL;
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
    var shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});

// GENERATING A RANDOM STRING FOR A SHORT URL
function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};

// APP LISTENING TO PORT
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});