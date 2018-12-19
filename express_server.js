const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id']
}));
app.set("view engine", "ejs");

//Database of shortened URLs
let urlDatabase = {
  "b2xVn2": {
    'userID': "1234",
    'shortURL': "b2xVn2",
    'longURL': "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    'userID': "1234",
    'shortURL': "9sm5xK",
    'longURL': "http://www.google.com"
  },
  "b4frh4": {
    'userID': "5678",
    'shortURL': "b4frh4",
    'longURL': "http://www.facebook.com"
  },
  "4ada44": {
    'userID': "5678",
    'shortURL': "4ada44",
    'longURL': "http://www.twitter.com"
  }
};

//Database of registered users
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

//Landing page (redirects to login page or /urls based on cookie information).
app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login")
  } else {
    res.redirect("/urls")
  };
});

//Get request handler for registration page.
app.get("/register", (req, res) => {
  let templateVars = {
  'user': users[req.session.user_id]
};
  if (templateVars.user === undefined) {
    res.render("urls_register", templateVars);
  } else {
    res.redirect("/urls");
  };
});

//Post request handler for registration page.
app.post("/register", (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let registered = registrationCheck(email);

  if (!email || !password) {
    res.status(400).send('Invalid username and/or password. Please try again.')
    return;
  };

  if (registered === true) {
    res.status(400).send('Your email address is already registered. Please log in.')
    return;
  };

  users[userId] = {
    id: userId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = userId;
  res.redirect("/");

});

//Get request handler for login page.
app.get("/login", (req, res) => {
  let templateVars = {
    'user': users[req.session.user_id]
  };
  if (templateVars.user === undefined) {
    res.render("urls_login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

//Post request handler for login page.
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let registered = registrationCheck(email);
  let userId = userIdCheck(email);

  if (registered === undefined) {
    res.status(403).send('Your email address is not registered. Please register your account.');
    return;
  };

  let passwordCheck = bcrypt.compareSync(password, users[userId].password);

  if (email === users[userId].email && passwordCheck === false) {
    res.status(403).send('Incorrect password. Please try again.');
    return;
  };

  if (email === users[userId].email && passwordCheck === true) {
    req.session.user_id = userId;
    res.redirect("/");
  };
});

//Post request handler for addition of new URL to database.
app.post("/urls", (req, res) => {
  let user = req.session.user_id;
  let longURL = urlCheck(req.body.longURL);
  let shortURL = generateRandomString();
  if (user === undefined) {
    res.redirect("/register");
  } else {
    urlDatabase[shortURL] = {
      'userID': user,
      'shortURL': shortURL,
      'longURL': longURL
    }
    res.redirect(`/urls/${shortURL}`);
  }
});

//Post request handler for logout button.
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Get request handler for main landing page based on user ID.
app.get("/urls", (req, res) => {
  let templateVars = {
    'urls': urlsForUser(req.session.user_id),
    'user': users[req.session.user_id]
  };
  if (templateVars.user === undefined) {
    res.render("urls_register", templateVars)
  } else {
    res.render("urls_index", templateVars)
  };
});

//Get request handler for adding a new link.
app.get("/urls/new", (req, res) => {
  let templateVars = {
    'user': users[req.session.user_id]
  };
  if (templateVars.user === undefined) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars)
  };
});

app.get("/urls/:id", (req, res) => {
  //if "user_id" cookie is empty/undefined, redirects to login page.
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  // if "user_id" cookie does not match database ID for short URL, sends a 403.
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send('You are not authorized to edit this link. Please try a different link.');
    return;
  // in every other situation, renders "urls_show" with short URL, long URL and user info.
  } else {
    let templateVars = {
      'shortURL': req.params.id,
      'longURL': urlDatabase[req.params.id].longURL,
      'user': users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

//Post request handler for the edit button.
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlCheck(req.body.longURL);
  //if "user_id" cookie does not match database ID for short URL, sends a 403.
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(403).send('You are not authorized to edit this link. Please try a different link.');
    return;
  //if the cookie and the database ID match, updates long URL and redirects to landing page.
  } else {
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
  }
});


//Post request handler for the delete function.
app.post("/urls/:id/delete", (req, res) => {
  //if "user_id" cookie does not match database ID for short URL, sends a 403.
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send('You are not authorized to delete this link. Please try a different link.');
  //if the cookie and the database ID match, deletes short URL entry and renders urls_index.
  } else if (req.session.user_id === undefined) {
    let templateVars = {
      'user': users[req.session.user_id]
    };
    res.render("urls_register", templateVars)
  } else {
    delete urlDatabase[req.params.id];
    let templateVars = {
      'urls': urlsForUser(req.session.user_id),
      'user': users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

//Get request handler for redirection from short URL to external long URL
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Helper function to generate randomized alphanumeric user ID for new users
function generateRandomString() {
  let alphaNumeric = "abcdefghijklmnopqrstuvwxyz0123456789"
  let string = '';
  for (let x = 0; x < 6; x++) {
    string += alphaNumeric[Math.floor(Math.random() * alphaNumeric.length)];
  };
  return string;
}

// Helper function to check if a user is already registered against database
function registrationCheck(email) {
  for (user in users) {
    if (users[user].email === email) {
      return true;
    }
  }
}

//Helper function to find the user's ID based on email address
function userIdCheck(email) {
  for (user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
}

//Helper function to sort through database and find URLs belonging to specific user
function urlsForUser(id) {
  let finalOutput = {};
  let arr = Object.keys(urlDatabase).filter(key => {
    return urlDatabase[key].userID === id;
  });
  arr.forEach(element => {
    finalOutput[element] = urlDatabase[element];
  })
  return finalOutput;
}

//Helper function to check URL and add protocol if necessary

function urlCheck(url) {
  if (url === undefined) {
    return '';
  } else if (url.startsWith('http://www.') || url.startsWith('https://www.')) {
    return url;
  } else if (url.startsWith('www')) {
    return 'http://' + url;
  } else {
    return 'http://www.' + url;
  }
}
