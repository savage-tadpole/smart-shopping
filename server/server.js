/*
* Express server running at http://localhost:3000
* TODO: add routing
* */

var express = require('express');
var listController = require('./lists/listController.js');
var itemController = require('./lists/itemController.js');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var firebaseAuth = require('./middleware/authFirebase');
var session = require('express-session');
var app = express();



//server is listening on port 3000
var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log('Smart Shopping listening at http://localhost:%s', port);
});

mongoose.connect('mongodb://localhost/smart-shopping');

listController.createUser();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use(function (req, res, next) {
  var ts = new Date();
  console.log(req.url + ' - ' + req.method);
  console.log('Time:', ts);
  next();
});

//creates sessions 
app.use(session({
  secret: 'savage tadpole',
  resave: false,
  saveUninitialized: true
}))

//static files will be served from the public directory
app.use(express.static(__dirname + '/../public'));


//registers user
app.post('/api/register', function(request, response, next){
  var email = request.body.email;
  var password = request.body.password;
  firebaseAuth.createUser(email, password, request, response, next);
  console.log('email - pass' + request.body.email + ' - ' + request.body.password);

});

//authentivates user
app.post('/api/signIn', function(request, response, next){
  var email = request.body.email;
  var password = request.body.password;
  firebaseAuth.signIn(email, password, request, response, next);
  console.log('email - pass' + request.body.email + ' - ' + request.body.password);
});

//checks if token session has expired
app.get('/protected', firebaseAuth.validateUserToken.bind(firebaseAuth) , function(request, response, next){
  response.redirect('/testIndex.html');
});

app.get('/api/list', listController.getList);

app.use('/api/item/add', itemController.createNewItem);
app.post('/api/item/add', listController.addItemToList); 



