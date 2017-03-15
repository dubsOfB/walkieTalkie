var db = require('../config.js')
var Sequelize = require('sequelize')


var UserInterests = db.define('UserInterest', {

  userId : {
    type : Sequelize.INTEGER,
    allowNull : false
  },
  interestId : {
    type : Sequelize.INTEGER,
    allowNull : false
  }
})


module.exports = UserInterests;
