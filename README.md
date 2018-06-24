# tiny-app
Web Project 1

Tiny-App is a simple app where the user can shorten a long url to a short url. The app includes a register and login page, and an urls page where the user can see/edit/delete short-long url.

The app is built on HTML, EJS using Express, Cookie Session and Bcrypt.

## Getting Started

1. Install dependencies using the `npm install` command.
3. Start the web server using the `npm run local` command. The app will be served at <http://localhost:8080/> or using the `node --inspect express_server.js`
4. Go to <http://localhost:8080/> in your browser.

## Dependencies

- Express
- Node 5.10.x or above
- Body Parser
- Bcrypt
- Connect-Flash
- Cookie-Session
- EJS
- Method-Override

## Screenshots

!["Screenshot of the main page - urls"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.42.27.png?raw=true)
!["Screenshot of the main page - urls when logged in"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.42.48.png?raw=true)
!["Screenshot of the add a new url when logged in"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.43.04.png?raw=true)
!["Screenshot of the main page with urls added when logged in"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.43.17.png?raw=true)
!["Screenshot of the short url to be updated when logged in"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.43.44.png?raw=true)
!["Screenshot of the error message - user not authenticated"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.44.06.png?raw=true)
!["Screenshot of the error message - email/password missing"](https://github.com/olimartin90/tiny-app/blob/master/docs/Screenshot%202018-06-24%2017.44.15.png?raw=true)