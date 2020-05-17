const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const cors = require('cors'); 
const userRouter = express.Router();

  
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/')
  },
  filename: (req, file, cb) => {
    cb(null,file.originalname)
  }
});

const upload = multer({storage: storage});

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

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true })
userRouter.use(cookieParser());
userRouter.use(cors({
  origin: 'http//localhost:3000',
  credentials: true
}));

userRouter.use('/data/:id',(req,res)=>{
  const userId = req.params.id;
  const token = req.cookies.access_token;
  try{
    const decoded = jwt.verify(token, secret);
  }catch(err){
    res.status(401).end();
    throw err;
  }
    res.status(200).send(readJsonFileSync(userId));
  
});

userRouter.use((err,req,res,next)=>{
  res.json(err);
})


userRouter.get('/',(req,res,next)=>{

});

const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
const secret = 'Secret';


userRouter.post("/login",  upload.single('myfile'), urlencodedParser, function(request,response){
    if(!request.body) return response.sendStatus(400);
  console.log(request.body);
  const login=request.body.login;
  const password=request.body.password;
  console.log(login+"  "+password);
  var id = lookForUser(login, password);
  if (id!=null){
    const payload = {
      login:login
    }
    const token = jwt.sign(payload,secret);
    console.log(token);
    response.cookie('access_token',token//,{
  );
    console.log(response.cookie);
    response.status(200).send({id:id});
  }else{
    response.status(401).send({ error: "account information not valid" });;
  }

});

userRouter.post("/registration",  upload.single('myfile'), urlencodedParser, function(request,response){
  if(!request.body) return response.sendStatus(400);
  console.log(request.body);
  if(request.body.password_reg==request.body.password_confirm){
    const userData={
      login:request.body.login_reg,
      pass:request.body.password_reg,
      email : request.body.email
    };
    addNewUser(userData);
    response.status(200).end();
  }else{
    response.status(401).end();
  }
});

function addNewUser(userData){
  
  users.push({_id:users.length, login: userData.login ,password:userData.pass,email:userData.email});
  var json = JSON.stringify(users); //convert it back to json
  console.log(json);
  fs.writeFile('users.json', json, 'utf8', (error)=>{
    console.log(error);
  });

  var obj=readJsonFileSync(-1);
  obj.users.push({id: obj.users.length, tasks:[]});

  var json = JSON.stringify(obj); //convert it back to json
  console.log(json);
  fs.writeFile('file.json', json, 'utf8', (error)=>{
    console.log(error);
  });
}

function lookForUser(login,password){

  for (var i=0 ; i < users.length ; i++)
  {
    console.log(users[i]);
    if (users[i].login == login && users[i].password == password) {
      return users[i]._id;
    }
  }
  return null;
}

module.exports = userRouter;