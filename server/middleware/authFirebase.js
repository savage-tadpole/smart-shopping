var Firebase = require("firebase");
var FirebaseTokenGenerator = require("firebase-token-generator");
var firebaseSecret = require("../firebaseSecret");

var FirebaseMakerFunction =  function() {
  this.refString = 'https://savagetadpole.firebaseio.com';
  this.ref = new Firebase(this.refString);
};

FirebaseMakerFunction.prototype.createUser = function(user, pass, cb){
  //Works
  //create user 
  console.log('creating user');
  this.ref.createUser({
    email    : user,
    password : pass
  }, function(error, authData, user, pass) {
    if(error) { 
      console.log("Creation Failed!", error);
    }  else {
      console.log("Created user successfully with payload:", authData.uid);
      console.log('user - ' + user);
      console.log('pass - ' + pass);
      cb();
    }
  });


};

FirebaseMakerFunction.prototype.signIn = function(user, pass){
  //works
  this.ref.authWithPassword({
    email    : user,
    password : pass
  }, function(error, authData) {
    if (error) {
      console.log("Login Failed!", error);
    } else {
      console.log("Authenticated successfully with payload:", authData);

    }
  });
};


var email = 'joe123456@gmail.com';
var pass = 'password';

console.log('creating fbase object');
var firebaseObj = new FirebaseMakerFunction();
console.log('invoking createUser');
firebaseObj.createUser(email, pass).then()


  console.log('user - ' + user);
  console.log('pass - ' + pass);
  firebaseObj.signIn(email, pass);


exports.module = Firebase;