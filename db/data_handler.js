var db = require('./config.js')
var Users = require('./schema/User.js')
var ActiveUsers = require('./schema/ActiveUsers.js');
var UserInterests = require('./schema/UserInterests.js');
var sequelize = require('sequelize')
var util = require('./util.js')
var Promise = require('bluebird')

module.exports.createUser = (nI, cb) => {
  db.query('select id from Users where email = ?',
  {replacements : [nI.email], type : sequelize.QueryTypes.SELECT})
  .then(userFound => {
    if (userFound.length > 0) {
      cb({invalid : true});
    } else {
      util.cipher(nI.password)
      .then(hashedPassword => {
        Users.create({email : nI.email, firstname : nI.firstname, lastname : nI.lastname, password : hashedPassword})
        .then(newUser => {
          cb(false, newUser.dataValues);
        })
        .catch(error => {
          cb(error);
        })
      })
      .catch(error => {
        cb(error);
      })
    }
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.createSession = (inputId, lat, long) => {
  return new Promise((resolve, reject) => {
    return db.query('select * from ActiveUsers where userId = ?',
    {replacements : [inputId], type : sequelize.QueryTypes.SELECT})
    .then(searchResult => {
      if (searchResult.length === 0) {
        return ActiveUsers.create({
          userId : inputId,
          latitude : lat,
          longitude : long
        })
        .then(createdUser => {
          return resolve(createdUser);
        })
        .catch(error => {
          return reject(error);
        })
      } else {
        return resolve(searchResult);
      }
    })
    .catch(error => {
      return reject(error);
    })
  })
}

module.exports.userLogin = (email, password, cb) => {
  db.query('select * from Users where email = ?', 
  {replacements : [email], type : sequelize.QueryTypes.SELECT})
  .then(userFound => {
    if (userFound.length === 1) {
      util.comparePassword(password, userFound[0].password)
      .then(match => {
        if (match) {
          cb(false, {id : userFound[0].id, firstname: userFound[0].firstname});
        } else {
          cb({invalid : true});
        }
      })
      .catch(error => {
        cb(error);
      })
    } else {
      cb({invalid : true});
    }
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.userLogout = (inputId, cb) => {
  db.query('delete from ActiveUsers where userId = ?',
  {replacements : [inputId], type : sequelize.QueryTypes.DELETE})
  .then(result => {
    cb(false);
  })
  .catch(error => {
    console.log('in error', error);
    cb(error);
  })
}

module.exports.exitRoom = (inputId, cb) => {
  console.log(inputId)
  db.query('update ActiveUsers set roomId = 0 where userId = ?', 
  {replacements : [inputId], type : sequelize.QueryTypes.UPDATE})
  .then(result => {
    cb(false);
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.findGlobalRoom = (inputId, cb) => {
    db.query('select roomId from ActiveUsers where roomId != 0 group by roomId having count(roomId) < 10', 
    {type : sequelize.QueryTypes.SELECT})
    .then(res1 => {
      if (res1.length === 0) {
        db.query('select max(roomId) from ActiveUsers',
        {type : sequelize.QueryTypes.SELECT})
        .then(res2 => {
          db.query('update ActiveUsers set roomId = ? where userId = ?',
          {replacements : [res2[0]['max(roomId)']+1, inputId], type : sequelize.QueryTypes.UPDATE})
          .then(res3 => {
            cb(false, res2[0]['max(roomId)']+1, true);
          })
          .catch(error => {
            cb(error);
          })
        })
        .catch(error => {
          cb(error);
        })
      } else {
        db.query('update ActiveUsers set roomId = ? where userId = ?',
        {replacements : [ res1[0].roomId, inputId], type : sequelize.QueryTypes.UPDATE})
        .then(res4 => {
          cb(false, res1[0].roomId, false)
        })
        .catch(error => {
          cb(error);
        })
      }
     })
    .catch(err => {
      console.log('error', err);
    })
}

module.exports.findLocalRoom = (user, lat, long, cb) => {
  db.query('select roomId from ActiveUsers where roomId != 0 group by roomId having count(roomId) < 10',
   {type : sequelize.QueryTypes.SELECT})
   .then(res1 => {
     if (res1.length === 0) {
        db.query('select max(roomId) from ActiveUsers',
        {type : sequelize.QueryTypes.SELECT})
        .then(res2 => {
          db.query('update ActiveUsers set roomId = ? where userId = ?',
          {replacements : [res2[0]['max(roomId)']+1, user], type : sequelize.QueryTypes.UPDATE})
          .then(res3 => {
            cb(false, res2[0]['max(roomId)']+1, true);
          })
          .catch(error => {
            cb(error);
          })
        })
        .catch(error => {
          cb(error);
        })
     } else {
       var roomsIds = [];

       res1.forEach(id => {roomsIds.push(id['roomId'])});
       db.query('select latitude, longitude, roomId from ActiveUsers where roomId in (?)',
        {replacements : [roomsIds], type : sequelize.QueryTypes.SELECT})
        .then(res4 => {

          var currDistance = 10000;
          var shortestPoint;

          for(var i = 0; i <res4.length; i++){
            var temp = util.distance(lat, long, res4[i]['latitude'], res4[i]['longitude']);
            if(temp < currDistance) {
              currDistance = temp;
              shortestPoint = res4[i]['roomId'];
            }
          }

          db.query('update ActiveUsers set roomId = ? where userId = ?',
          {replacements : [shortestPoint, user], type : sequelize.QueryTypes.UPDATE})
          .then(res5 => {
            cb(false, shortestPoint, false, currDistance);
          })
          .catch(error => {
            cb(error);
          })
        })
        .catch(error => {
          cb(error);
        })
     }
   })
   .catch(error => {
     cb(error);
   })
}

module.exports.getAllInterests = (cb) => {
  db.query('select id, Interest from Interests', 
  {type : sequelize.QueryTypes.SELECT})
  .then(results => {
    cb(false, results);
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.getUserInterests = (inputId, cb) => {
  db.query('select i.id, i.Interest from UserInterests uI join Interests i on uI.interestId = i.id where uI.userId = ?',
  {replacements : [inputId], type : sequelize.QueryTypes.SELECT})
  .then(result => {
    cb(false, result);
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.saveUserInterests = (inputId, interests, cb) => {
  db.query('delete from UserInterests where userId = ?',
  {replacements : [inputId], type : sequelize.QueryTypes.DELETE})
  .then(result => {
    for (var i in interests) {
      if (interests[i]) {
        UserInterests.create({
          userId : inputId,
          interestId : i
        })
      }
    }
    cb(false, 'Success');
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.findCommonUser = (user, cb) => {
  db.query('select roomId from ActiveUsers where roomId != 0 group by roomId having count(roomId) < 10', 
    {type : sequelize.QueryTypes.SELECT})
    .then(res1 => {
      if (res1.length === 0) {
        cb(false, false);
      } else {
        db.query('select interestId from UserInterests where userId = ?',
        {replacements : [user], type : sequelize.QueryTypes.SELECT})
        .then(foundInterests => {

          var roomsIds = [];
          var interestIds = [];
          res1.forEach(id => {roomsIds.push(id['roomId'])});
          foundInterests.forEach(interest => {interestIds.push(interest['interestId'])});

          db.query('select UI.userId AS User, AU.roomId AS Room, count(*) AS Total_Match from ActiveUsers AU join UserInterests UI on UI.userId = AU.userId where UI.interestId in (?) and AU.roomId in (?) group by UI.userId, AU.roomId order by Total_Match DESC',
          {replacements : [interestIds, roomsIds], type : sequelize.QueryTypes.SELECT})
          .then(foundUsers => {
            if(foundUsers.length===0){
              cb(false, false)
            } else {
              db.query('update ActiveUsers set roomId = ? where userId = ?',
              {replacements : [foundUsers[0]['Room'], user], type : sequelize.QueryTypes.UPDATE})
              .then(updatedUser => {
                db.query('select interest from Interests i join UserInterests ui on i.id = ui.interestId where ui.interestId in (?) and ui.userId = ?',
                {replacements : [interestIds, foundUsers[0]['User']], type : sequelize.QueryTypes.SELECT})
                .then(commonInterests => {
                  cb(false, foundUsers[0]['Room'], commonInterests);
                })
                .catch(error => {
                  cb(error);
                })
              })
              .catch(error => {
                cb(error)
              })
            }
          })
          .catch(error => {
            cb(error);
          })
        })
        .catch(error => {
          cb(error)
        })
      }
    })
    .catch(error => {
      cb(error)
    })
}

module.exports.getActiveUsers = (inputRoomId, userId, cb) => {
  db.query('select u.firstname, u.id from Users u join ActiveUsers au on u.id = au.userId where au.roomId = ? and u.id != ? and au.roomId !=0 order by u.firstname ASC',
  {replacements : [inputRoomId, userId], type : sequelize.QueryTypes.SELECT})
  .then(userList => {
    cb(false, userList);
  })
  .catch(error => {
    cb(error);
  })
}

module.exports.getMapLocations = (cb) => {
  db.query('select latitude as lat, longitude as lng from ActiveUsers', 
    {type : sequelize.QueryTypes.SELECT})
    .then(locations => {
      cb(false, locations);
    })
    .catch(error => {
      cb(error);
    })
}