var Q = require('q');
var mongoose = require('mongoose');
var models = require('../../db/database.js');
var Item = mongoose.model('Item', models.item);
var User = mongoose.model('User', models.user);
var interimUsername = 'emily'


module.exports = {

  createUser: function() {
    var user = new User({username:interimUsername, list:[], past_items:[]})

    User.find({username: interimUsername}, function(err, users) {
      if (err) console.error(err);
      if (users.length > 0) {
      } else {
        User.create(user, function(err, newUser) {
          if(err) console.error(err);
          console.log('User created! Welcome: ', newUser.username);
        });
      }
    });
  },
  
  getList: function(req, res) {
    var username = interimUsername;
    User
    .findOne({username: username})
    .populate('list')
    .exec(function(err, user) {
      if (err) console.error(err);
      res.send(user.list);
    })
  },

  addItemToList: function(req, res) {
    var username = interimUsername;
    var name = req.smartShoppingData.name;
 
    var findUser = Q.nbind(User.findOne, User);

    findUser({username: username})
    .then(function(user) {
      User.findByIdAndUpdate(
        user._id,
        {$push: {'list': req.smartShoppingData._id}},
        {safe: true, upsert:true},
        function(err, model) {
          if (err) console.error(err);
        }
      );
      res.send(user.list);
    })
    .catch(function(err) {
      console.error(err);
      res.status(500).send({error: 'Server Error'});
    })
    .done(function(err) {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Server Error' });
      }
    });
  },

  deleteItemFromList: function(req, res) {
    var username = iterimUsername;
    var name = req.body.name
    var frequency = req.body.frequency;
    var item = new Item({
      name: name
      data: {
        frequency: frequency,
        coupons: ['none'],
        food_category: 'none',
        expiration: new Date(2015,6,16)
      }
    });

    var findUser = Q.nbind(User.findOne, User);
    var findItem = Q.nbind(Item.findOne, Item);

    findItem({name: name})
    .then(function(match) {
      findUser({username: username})
      .then(function(user) {
        User.findByIdAndUpdate(
          user._id,
          ($pull: {'list': match._id}),
          {safe: true, upsert: true},
          function(err, model) {
            if(err) console.error(err);
          }
        );
        res.send(user.list);   
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send({ error: 'Server Error' });
      })
      .done(function(err) {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Server Error'});
        }
      });
    });
  },

  addItemToArchive: function(req, res) {
  var username = interimUsername,
  var itemId = req.body.id;

  var findItem = Q.nbind(Item.findOne, Item);
  var findUser = Q.nbind(User.findOne, User);

  findItem({_id: itemId})
  .then(function(match) {
    findUser({username: username})
    .then(function(user) {
      User.findByIdAndUpdate(
        user._id,
        {$pull: {'list': match._id}, $push: {'past_items': match._id}},
        {safe: true, upsert:true },
        function(err, model) {
          if (err) console.error(err);
        }
      )
        res.send(user.list)
      })
      .catch(function(err) {
        console.error(err);
        res.status(500).send({ error: 'Server error' })
      })      
      .done(function(err) {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Server error'});
        }
      });
    });
  }
};