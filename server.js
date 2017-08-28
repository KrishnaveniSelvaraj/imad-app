var express = require('express');
var morgan = require('morgan');
var path = require('path');
var crypto = require('crypto');

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

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input,salt){
    var hashed = crypto.pbkdf2Sync('input', 'salt', 100000, 512, 'sha512');
    return hashed.tostring('hex');
}

app.get('/hash/:input',function(req,res){
    var hashedstring=hash(req.params.input,'this-is-some-random-string');
    res.send(hashedstring);
    
});

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
