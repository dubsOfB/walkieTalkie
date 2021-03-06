var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session')
var path = require('path')
var database = require('./db/config.js')
var Users = require('./db/schema/User.js')
var ActiveUsers = require('./db/schema/ActiveUsers.js')
var dataHandler = require('./db/data_handler.js')
var http = require('http');
var socketIo = require('socket.io');
var port = 3000

var app = express()
//need to create server for socket.io
var server = http.createServer(app);
var io = socketIo(server);
module.exports.app = app;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret : "walkienotTalkie",
  resave: false,
  saveUninitialized: true,
  duration : 15 * 60 * 1000,
  activeDuration : 15 * 60 * 1000
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'))
});

app.get('/checkSession', (req, res) => {
  res.status(200).send({id : req.session.userId, roomId : req.session.roomId, firstname : req.session.userName});
});


app.get('/findGlobalRoom', (req, res) => {
  dataHandler.createSession(req.session.userId, req.query.latitude, req.query.longitude)
  .then(sessionCreated => {
    dataHandler.findGlobalRoom(req.session.userId, (error, result, host) => {
      if (error) {
        res.status(500).send(error);
      } else {
        req.session.roomId = result;
        res.status(200).json({'host' : host, 'roomId' : result});
      } 
    })
  })
  .catch(error => {
    res.status(500).send(error);
  })
})

app.get('/findLocalRoom', (req, res) => {
 dataHandler.createSession(req.session.userId, req.query.latitude, req.query.longitude)
 .then(sessionCreated => {
    dataHandler.findLocalRoom(req.session.userId, req.query.latitude, req.query.longitude, (error, result, host, distance) => {
      if (error) {
        res.status(500).send(error);
      } else {
        req.session.roomId = result;
        res.status(200).json({'host' : host, 'roomId' : result, 'distance' : distance});
      }
    })
 })
 .catch(error => {
   res.status(200).send(error);
 })
})

app.post('/signup', (req, res) => {
  dataHandler.createUser(req.body, (error, result) => {
    if (error) {
      res.status(500).send(error);
    } else {
      req.session.userId = result.id;
      req.session.userName = result.firstname;
      res.status(200).json(result);
    }
  })
});

app.post('/login', (req, res) => {
  dataHandler.userLogin(req.body.email, req.body.password, (error, result) => {
    if (error) {
      res.status(500).send(error);
    } else {
      console.log('result', result);
      req.session.userId = result.id;
      req.session.userName = result.firstname;
      res.status(200).json(result);
    }
  })
});

app.post('/logout', (req, res) => {
  dataHandler.userLogout(req.body.id, error => {
    if (error) {
      res.status(500).send(error);
    } else {
      req.session.destroy();
      res.status(200).send('Logout successfull');
    }
  })
})

app.post('/exitChat', (req, res) => {
  dataHandler.exitRoom(req.body.id, error => {
    if (error) {
      res.status(500).send(error);
    } else {
      req.session.roomId = null;
      res.status(200).send('Exit Successfull')
    }
  })
})

io.on('connection', socket => {
  console.log('sockets connected');
  socket.on('join room', function(room) {
    console.log('joining room ', room);
    socket.join(room);
  })
  socket.on('message', message => {
    console.log('sending message in room ::::: ', message.room);
    socket.broadcast.in(message.room).emit('message', {
      body: message.body,
      from: message.from
    })
  })
})

database.sync()
  .then(res => {
    //must listen on server, not app, otherwise sockets won't connect
    server.listen(port, function() {
    console.log('Listening On localhost:' + port)
    });
  })
  .catch(error => {
    console.log('Database did not sync: ', error)
  })

