var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var Pool=require('pg').Pool;
var session=require('express-session');

var config={
   user:'krishnaveniselvaraj',
   database:'krishnaveniselvaraj',
   host:'db.imad.hasura-app.io',
   port:'5432',
   password:process.env.DB_PASSWORD
   
}



var articleOne={
    title:'ArticleOne',
    heading:'ArticleOne',
    date:'Sep 5 2016',
    content:`<h1>This is articleOne created in server.js</h1>
    <p>Content</p>
    `
    
}



function CreateTemplate(data)
{
   var title=data.title;
   var date=data.date;
   var heading=data.heading;
   var content=data.content;
   var htmlTemplate=`
   
   <html>
   
   <head>
   <title>
   ${title}
   </title>
   
   </head>
   
   <body>
   <div class="container">
   <h3>${heading}<h3>
   <div>${date}</div>
   <div>${content}</div>
   
   
   
   </div>
   
   </body>
   </html>`
   return htmlTemplate;
   
}
var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret:'someRandomSecretValue',
    cookie:{maxAge:1000*60*60*24*30}
    
}));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});
//password security
function hash(input,salt){
    var hashed = crypto.pbkdf2Sync(input, salt, 100000, 512, 'sha512');
    
     return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input',function(req,res){
    var hashedstring=hash(req.params.input,'this-is-some-random-string');
    res.send(hashedstring);
    
});
//password security end

//inserting username and password in db
var pool=new Pool(config);
app.post('/create-user',function(req,res)
{
    var username=req.body.username;
    var password=req.body.password;
    var salt=crypto.randomBytes(128).toString('hex');
    var dbString=hash(password,salt);
    pool.query('INSERT INTO "hash" (username,password) VALUES ($1,$2)',[username,dbString],function(err,result) {
        if(err){
            res.status(500).send(err.toString());
        }else
        {
            res.send('User Successfully created:' + username);
        }
        
    })
});

//username and password validation in login
app.post('/login',function(req,res)
{
   //JSON
   //{"username":"priya","password":qwe"}
  var username=req.body.username;
  var pass=req.body.password;
  console.log("user"+username);
  console.log("userpwd"+pass);

  pool.query('SELECT * FROM  hash WHERE username=$1',[username],function(err,result){
        if(err)
       {
           res.status(500).send(err.toString());
           
       }
       else
       {
           if(result.rows.length===0){
           res.status(403).send("username/password is invalid");
           }
       
       else
       {
         var dbString=result.rows[0].password;
         console.log("result"+result.rows[0].password);
         var salt=dbString.split('$')[2];
         var hashedPassword=hash(pass,salt);
         console.log(hashedPassword);
         if(hashedPassword===dbString)
         {
             
             
             req.session.auth={userId:result.rows[0].id};
             res.send('credentials correct');
            
         } else
             {
                  res.status(403).send("username/password is invalid");
             }
         }
       }
  
  });
});
//check session login

app.get('/check-login',function(req,res){
    if(req.session && req.session.auth &&req.session.auth.userId){
        res.send('You are logged in:'+req.session.auth.userId.toString());
    } else {
        res.send('You are not logged in');
    }
});

//session logout
app.get('/logout',function(req,res)
{
    delete req.session.auth;
    res.send("Logged out successfully");
})



//counter while refreshing value increases2
var counter=0;
app.get('/counter',function(req,res){
    counter=counter+1;
    res.send(counter.toString());
})

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});
app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});
//url
app.get('/article-one', function (req, res) {
  res.send(CreateTemplate(articleOne));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
