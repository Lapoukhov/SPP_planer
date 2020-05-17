var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
var app = express();
var socket = require('socket.io');

app.use(cookieParser());

app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000

// устанавливаем движок EJS для представления
app.set('views','./views');
app.set('view engine','ejs');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())


app.get('/', function(req, res) {
  res.render('pages/index');
  
});


app.post("/", function (request, response) {
  
});


var server = app.listen(port, function(){
  console.log('Приложение запущено! Смотрите на http://localhost:3000')
});

var io = socket(server);
io.set('transports', ['polling', 'websocket']);

const taskRoutes=require('./api/routes/tasks')(io);
app.use('/tasks',taskRoutes);

const userRoutes=require('./api/routes/user');
app.use('/user',userRoutes);