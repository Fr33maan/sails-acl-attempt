/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var bcrypt = require('bcrypt')

module.exports = {

  cacheValidity : 0,

  attributes: {
    username:{
      required : true,
      type : 'string',
      unique: true,
    },

    email:{
      required : true,
      type : 'string',
      unique: true,
    },

    password:{
      type : 'string',
      required: true,  
    },

    rank:{
      type : 'string',
      defaultsTo: 'user',
    },

    playeruuid : {
      type : 'string',
      unique : true,
    },

    activated:{
      type : 'boolean',
      defaultsTo: false,
    },

    activationPass:{
    	type : 'string',
    },

    tests : {
      collection : 'test',
      via : 'owner',
    },
  },

  crud_config : {
    read : {
      size : 100,

      right_config : {

        username : {
          right : {
            rank : 'user',
          }
        },

        email : {
          right : {
            rank : 'user',
            privateAttr : true,
            op : 'moderator',
          }
        },

        password : {
          right : {
            rank : 'user',
            privateAttr : true,
            op : 'webadmin',
          }
        },
      },
    },


    create : {

      right_config : {

        username : {
          right : {
            rank : 'guest',
          }
        },

        email : {
          right : {
            rank : 'guest',
            privateAttr : true,
            op : 'webadmin',
          }
        },

        password : {
          right : {
            rank : 'guest',
            privateAttr : true,
            op : 'webadmin',
          }
        },
      },
    },

    update : {  
      right_config : {
        email : {
          right : {
            rank : 'user',
            privateAttr : true,
            op : 'webadmin',
          }
        },

        password : {
          right : {
            rank : 'user',
            privateAttr : true,
            op : 'webadmin',
          }
        },
      }
    },

  },

  beforeCreate : function(user, cb){
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) {
          console.log(err);
          cb(err);
        }else{
          user.password = hash;
          cb(null, user);
        }
      });
    });
  },

  
};

