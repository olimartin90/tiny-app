const express       = require("express");
const app           = express();
const PORT          = 8080; // default port 8080
const cookieSession = require("cookie-session");
const bodyParser    = require("body-parser");
const bcrypt        = require("bcrypt");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: "session",
  keys: ["Hello folks, I like motocross"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");


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
        password: bcrypt.hashSync("1234", 10)
    },
    "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("4321", 10)
    },
    "123userRandomAbcID": {
        id: "123userRandomAbcId",
        email: "olifear@hotmail.com",
        password: bcrypt.hashSync("1q2w3e", 10)
    }
};


// GENERATING A RANDOM STRING FOR A SHORT URL
function generateRandomString() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
};


// FUNCTION TO VERIFY AND THEN REGISTER EMAIL
function EmailRegistration(req, res) {
    let id = generateRandomString();
    let emailEntry = req.body.email;
    let passwordEntry = req.body.password;
    if (!emailEntry || !passwordEntry) {
        res.send(400);
    }
    if (emailEntry.length) {
        let emailExist = false;
        for (let userKey in users) {
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
                password: bcrypt.hashSync(req.body.password, 10)
            }
            res.cookie("user_id", id);
        }
    }
};


// FUNCTION TO FILTER URLS ACCORDING THE USER ID
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


// POST THE EMAIL WITH COOKIES FOR LOGGING IN
app.post("/login", (req, res) => {
    let emailLogin = req.body.email;
    let passwordLogin = req.body.password;
    let userAuthenticated = false;
    for (let userId in users) {
        if (emailLogin === users[userId].email && bcrypt.compareSync(passwordLogin, users[userId].password)) {
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
    res.redirect("/login");
});


// PAGE WITH THE FILTERED URLS WHEN USER LOGGED IN
app.get("/urls", (req, res) => {
    let templateVars = {
        urls: filterUrls(req.cookies["user_id"]),
        user: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
});


// URLS NEW ENTRY PAGE FOR USER
app.get("/urls/new", (req, res) => {
    if (req.cookies.user_id && users[req.cookies.user_id]) {
        let templateVars = {
            user: users[req.cookies["user_id"]]
        }
    res.render("urls_new", templateVars);
    } else {
        res.redirect("/login");
    }
});


// POST THE NEW GENERATED SHORT URL - LONG URL IN THE DATABASE (UPDATE THE DB)
app.post("/urls", (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] = {
        longURL: longURL,
        userId: req.cookies.user_id
    };
    res.redirect("/urls");
});



// PAGE SHOWING THE SINGLE URL AND LONG URL
app.get("/urls/:id", (req, res) => {
    let shortURL = req.params.id;
    let longURL = urlDatabase[shortURL].longURL;
    let templateVars = {
        shortURL: shortURL,
        longURL: longURL,
        user: users[req.cookies["user_id"]]
    };
    res.render("urls_show", templateVars);
});

// POST THE URL UPDDATED AFTER EDITING
app.post("/urls/:id", (req, res) => {
    let shortURL = req.params.id
    let longURL = req.body.longURL;
    console.log("cookie", req.cookies.user_id);
    console.log("urlDatabase[shortURL].userId", urlDatabase[shortURL].userId)
    if (req.cookies.user_id === urlDatabase[shortURL].userId) {
        urlDatabase[shortURL] = {
        shortURL: shortURL,
        longURL: longURL,
        userId: req.cookies.user_id
        }
    res.redirect("/urls");
    } else {
        res.send(403, "Cannot Update");
    }
});


// PAGE TO THE LONG URL FROM THE SHORT URL
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.id;
    let longURL = urlDatabase[req.params.shortURL].longURL;
    let redirectURL;
    if (!longURL.includes('http')) {
        redirectURL = 'http://' + longURL;
    } else {
        redirectURL = longURL;
    };
    res.redirect(redirectURL);
});


// DELETE URL
app.post("/urls/:id/delete", (req, res) => {
    let shortURL = req.params.id;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
});


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


// APP LISTENING TO PORT
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});