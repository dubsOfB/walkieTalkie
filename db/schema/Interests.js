var db = require('../config.js')
var Sequelize = require('sequelize')

var Interests = db.define('Interests', {
  interest : {
    type : Sequelize.STRING,
    allowNull : false
  }
});

module.exports = Interests;