const express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
const fsp = require('fsp');
var multer = require('multer');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const secret = 'Secret';

var querystring = require('querystring');

  // create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })

const router = express.Router();

router.use(cookieParser());
router.use(cors({
  origin: 'http//localhost:3000',
  credentials: true
}));

router.use(async(req,res)=>{
  
  const token = req.cookies.access_token;
  try{
    const decoded = await jwt.verify(token, secret);
  }catch(err){
    res.status(401).end();
    throw err;
  }
  req.next();
  
});

  function readJsonFileSync(userId){
    var somedata = JSON.parse(fs.readFileSync('file.json', 'utf8'));
    for (var i=0 ; i < somedata.users.length ; i++)
    {
      console.log(somedata.users[i]);
      if (somedata.users[i].id == userId) {
        return JSON.stringify(somedata.users[i].tasks)
      }
    }
    return somedata
  }
  
  function getJsonFromFile(userId){
    var somedata = JSON.parse(fs.readFileSync('file.json', 'utf8'));
    for (var i=0 ; i < somedata.users.length ; i++)
    {
      console.log(somedata.users[i]);
      if (somedata.users[i].id == userId) {
        return JSON.stringify(somedata)
      }
    }
    return null;
  }

  async function updateObj(obj,request){
    var bool=false;
    var data_tasks = querystring.parse(request.task);
    var fName="",fContent="", fType="";
    
    for (var i=0 ; i < obj.length ; i++)
    {
      if (obj[i].taskName == data_tasks.taskName) {
        bool=true;
        obj[i].deadline=data_tasks.deadline;
        obj[i].status=data_tasks.status;
        if(request.file!=undefined){
          fName=request.file.filename; 
          obj[i].fileName=fName;
          obj[i].fileType=request.file.fileType;
          let newFileName = await SaveFile(fName, request.file.fileContent);
        }
        break;
      }
    }
    return bool;
  }

module.exports = function(io) {

  io.on('connection', function (socket) {
    console.log('made connection',socket.id);
    socket.on('create', async function(data) {
      data = JSON.parse(data);
      var data_tasks = querystring.parse(data.task);
      console.log(data);
      var obj=JSON.parse(getJsonFromFile(data.id));
      var userTasks=JSON.parse(readJsonFileSync(data.id));
      var fName="",fContent="", fType="";
      if(data.file!=undefined){
        fName=data.file.filename; 
        fContent=data.file.fileContent;
        fType=data.file.fileType;
        let newFileName = await SaveFile(fName, data.file.fileContent);
      }
      
      userTasks.push({taskName: `${data_tasks.taskName}`, deadline:`${data_tasks.deadline}`,
      status:`${data_tasks.status}`, fileName: fName, fileType: fType});
      obj.users[data.id].tasks={};
      obj.users[data.id].tasks=userTasks;
      var json = JSON.stringify(obj); //convert it back to json
      console.log(json);
      
      fs.writeFile('file.json', json, 'utf8', (error)=>{
        console.log(error);
      });
      socket.emit("create",userTasks);

    });

    socket.on('update', async function(data) {
      data = JSON.parse(data);
      console.log(data);
      var obj=JSON.parse(getJsonFromFile(data.id));
      var userTasks=JSON.parse(readJsonFileSync(data.id));
      
      let flag = await updateObj(userTasks,data);
      obj.users[data.id].tasks={};
      obj.users[data.id].tasks=userTasks;
      var json = JSON.stringify(obj); //convert it back to json
      console.log(json);
      fs.writeFile('file.json', json, 'utf8', (error)=>{
        console.log(error);
      });
      socket.emit("update",userTasks);
    });

    socket.on('delete', async function(data) {
      data = JSON.parse(data);
      console.log(data);
      var obj=JSON.parse(getJsonFromFile(data.id));
      var userTasks=JSON.parse(readJsonFileSync(data.id));
      
      for (var i=0 ; i < userTasks.length ; i++)
      {
        if (userTasks[i].taskName == data.task) {
          userTasks.splice(i, 1);
          break;
        }
      }
      obj.users[data.id].tasks={};
      obj.users[data.id].tasks=userTasks;
      var json = JSON.stringify(obj); //convert it back to json
      console.log(json);
      fs.writeFile('file.json', json, 'utf8', (error)=>{
        console.log(error);
      });
      socket.emit("delete",userTasks);
    });

    socket.on("download", async file => {
      let data = JSON.parse(file);
      let dataBuffer =  await ReadFile(data.Name);//.then(data => {
      var arrayBuffer = ToArrayBuffer(dataBuffer);
      // })
      socket.emit("download", {buffer:arrayBuffer, fName: data.Name});
    });

    socket.on("getUserTasks",async User =>{
      var userTasks=JSON.parse(readJsonFileSync(User));
      socket.emit("getUserTasks",userTasks);
      
    });

  });

 return router;
}

async function SaveFile(fileName, data) {
  // let newName = `${Date.now()}.${fileName}`;
  var buf = new ArrayBuffer(data.length);
  var fileData = new Uint8Array(buf);
  for (var i=0; i<data.length; i++)
    fileData[i] = data.charCodeAt(i);
  try {
    fs.appendFile("./uploads/"+fileName, new Buffer(fileData), function (err) {
  });
    return fileName;
  } catch (e) {
    console.log("File could not be saved.",e);
  }
}

async function ReadFile(fileName) {
  let fullName = "./uploads/"+fileName;
  var result = "error";
  try {
     result = await readFile(fullName);
  } catch (e) {
    console.log("File could not be read.",e);
  }
 return result;
}

function ToArrayBuffer(buffer) {
  var arrayBuffer = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(arrayBuffer);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}