// import koa
const Koa = require('koa');
const serve = require('koa-static');
const cors = require('@koa/cors');

// import koa-router which is used to route user request to its path
const Router = require('koa-router');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');


// import koa-body parser whic his used to extract parameters from requests

// create a koa instance and store it in app variable
const app = new Koa();
app.keys = ['darkSecret'];

app.use(bodyParser());
app.use(session(app));
app.use(cors());
app.use(serve('./public'));
const router = new Router();


// use the root routes
app.use(router.routes());

// import the Router we defined in articles.js
const users = require('./routes/users');
const editUser = require('./routes/edit');
const upload = require('./routes/upload');


// apply the routes as a middleware
app.use(users.routes());
app.use(upload.routes());
app.use(editUser.routes());


// run the werver on port 3000
app.listen(3000);
