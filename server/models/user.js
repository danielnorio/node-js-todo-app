const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 8
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
  var tokenObj = {access, token};
  
  // This works for moongose >= 5.0.0 and Lodash 4.17.5
  // Concat doesn't for some reason
  user.tokens.push(tokenObj);
  
  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  
  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {
    // return new Promise((resolve, reject) => {
    //   reject();
    // });
    return Promise.reject('');
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

};

UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject(404);
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          reject(err);
        }
        else if (result) {
          resolve(user);
        }
        else {
          reject(401);
        }
      }, (percentage) => {
        //console.log(percentage);
      });
    });
  
  });

}

UserSchema.pre('save', function (next) {
  var user = this;
  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.log(err);
        next();
      }
      
      bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }
          user.password = hash;
          next();
      });
    });

  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};