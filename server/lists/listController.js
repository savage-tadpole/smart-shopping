var Q = require('q'),
  mongoose = require('mongoose'),
  models = require('../../db/database.js'),
  Item = mongoose.model('Item', models.item),
  User = mongoose.model('User', models.user),
  interimUsername = 'emily';


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
  };

  addItem: function(req, res) {
    var username = interimUsername;
        name = req.body.name,
        frequency = req.body.frequency,
        item = new Item({
          name: name,
          data: {
            frequency: frequency,
            coupons: ['none'],
            food_category: 'none',
            expiration: new Date(2015,8,16)
          }
        });

    var createItem = Q.nbind(Item.create, Item);
    var findItem = Q.nbind(Item.findOne, Item);
    var findUser = Q.nbind(User.findOne, User);

    findItem({name : name})
    .then(function(match) {
      if (match) {
        findUser({username: username})
        .then(function(user) {
          User.findByIdAndUpdate(
            user._id,
            {$push: {'list': match._id}},
            {safe:true, upsert:true},
            function(err, model) {
              if(err) console.log(err);
            }
          );
          res.send(match);
        })
        .catch(function(err) {
          console.error(err);
          res.status(500).send({ error: 'Server Error' });
        })
      } else {
        createItem(item)
        .then(function(createdItem) {
          findUser({username: username})
          .then(function(user) {
            User.findByIdAndUpdate(
              user._id,
              {$push: {'list': createdItem._id}},
              {safe:true, upsert:true},
              function(err, model) {
                if(err) console.error(err);
              }
            );
            res.send(createdItem);
          })
          .catch(function(err) {
            console.error(err);
            res.status(500).send({ error: 'Server Error' });

          });
        })
        .catch(function(err) {
          console.error(err);
          res.status(500).send({ error: 'Server Error' });
        });
      }
    })
    .done(function(err) {
      if (err) {
        console.error(err);
        res.status(500).send({ error: 'Server Error' });
      }
    });
  },

  deleteItemFromList: function(req, res) {
    var username = interimUsername,
        itemId = req.params.id;

    var findUser = Q.nbind(User.findOne, User);
    var findItem = Q.nbind(Item.findOne, Item);

    findItem({_id: itemId})
    .then(function(match) {
      findUser({username: username})
      .then(function(user) {
        User.findByIdAndUpdate(
          user._id,
          {$pull: {'list': match._id}},
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
        itemId = req.body.id;

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
}
