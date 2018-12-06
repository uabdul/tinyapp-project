const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "1234": {
    id: "1234",
    email: "umair.abdulq@gmail.com",
    password: "test1234"
  },
  "5678": {
    id: "5678",
    email: "ricky.varghese@gmail.com",
    password: "test5678"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/register", (req, res) => {
  let templateVars = {
    'user': users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let registered = registrationCheck(email);

  if (!email || !password) {
    res.status(400).send('Invalid username and/or password. Please try again.')
  };

  if (registered === true) {
    res.status(400).send('Your email address is already registered. Please log in.')
  }

  users[userId] = {
    id: userId,
    email,
    password,
  };
  res.cookie('user_id', userId);
  res.redirect("/");

});

app.get("/login", (req, res) => {
  let templateVars = {
    'user': users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let registered = registrationCheck(email);
  let userId = userIdCheck(email);

  console.log( email, password, registered, userId);

  if (registered === undefined) {
    res.status(403).send('Your email address is not registered. Please register your account.')
  };

  if (email === users[userId].email && password !== users[userId].password) {
    res.status(403).send('Incorrect password. Please try again.')
  };

  if (email === users[userId].email && password === users[userId].password) {
    console.log(users[userId]);
    res.cookie('user_id', userId);
    res.redirect("/");
  };
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    'urls': urlDatabase,
    'user': users[req.cookies["user_id"]]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    'user': users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    'shortURL': req.params.id,
    'longURL': urlDatabase[req.params.id],
    'user': users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  let templateVars = {
    'urls': urlDatabase,
    'user': users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  let alphaNumeric = "abcdefghijklmnopqrstuvwxyz0123456789"
  let string = '';
  for (let x = 0; x < 6; x++) {
    string += alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)];
  };
  return string;
}

function registrationCheck(email) {
  for (user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
}

function userIdCheck(email) {
  for (user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
}