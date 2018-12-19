# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Final Product

!["Screenshot of registration page"](https://github.com/uabdul/tinyapp-project/blob/master/docs/tinyapp-landingpage.png?raw=true)
!["Screenshot of user page"](https://github.com/uabdul/tinyapp-project/blob/master/docs/tinyapp-userpage.png?raw=true)

The final product is an app that requires users to register or, if they have previously registered, login to create shortened URLs.

TinyApp utilizes the bcrypt hashing function to ensure that user password information is secure and protected. However, we recommend that you select a unique password when registering for the application.

Once logged in, users are able to:
- shorten URLs, and share the shortened URL with anyone.
- view all of their shortened URLs.
- edit and delete previously shortened URLs.

Please note that although users cannot shortened URLs with anyone, they cannot edit or delete a shortened URL that has been created by another user of TinyApp.

**NOTE: In order to create an individual user experience, TinyApp uses encrypted cookies.**

## Dependencies

TinyApp requires the following dependencies:

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

In order to use TinyApp, please follow these steps:
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
- Create an account and start shortening URLs!