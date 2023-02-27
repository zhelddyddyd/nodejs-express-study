const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
app.use(helmet());
var session = require('express-session');
var FileStore = require('session-file-store')(session)

const indexrouter = require('./routes/index');
const topicRouter = require('./routes/topic');
const authRouter = require('./routes/auth');
const auth = require('./lib/auth');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({
  secret: 'secreting',
  resave: false,
  saveUninitialized: true,
  store: new FileStore()
}))

const authData = {
  email:'stay@naver.com',
  password: '1111',
  nickname: 'stay'
}

const passport = require('passport'),
LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done) => {
  console.log('serializeUser', user);
  done(null, user.email);
});

passport.deserializeUser((id, done) => {
  console.log('deserializeUser', id);
  done(null, authData);
});

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'pwd'
  },
  (username, password, done) => {
    console.log('LocalStrategy', username, password);
    if(username === authData.email){
      console.log(1);
      if(password === authData.password){
        console.log(2);
        return done(null, authData);
      }else{
        console.log(3);
        return done(null, false, {
          message: 'Incorrect password.'
        })
      }
    }else{
      console.log(4);
      return done(null, false, {
        message: 'Incorrect username.'
      })
    }
  })
);

app.post('/auth/login_process',
  passport.authenticate('local', { // 전략은 로그인 방식 (id/pwd 를 사용하는 것)
    successRedirect: '/',
    failureRedirect: '/auth/login'
  })
);

app.get('*', (req, res, next) => {
  fs.readdir('./data', (error, filelist) => {
    req.list = filelist;
    next();
  });
});

app.use('/', indexrouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);

app.use((req,res,next) => {
  res.status(404).send("SORRY NOT HERE!");
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// app.listen(port) 와 같음]
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
// var http = require('http');
// var fs = require('fs');
// var url = require('url');
// var qs = require('querystring');
// var template = require('./lib/template.js');
// var path = require('path');
// var sanitizeHtml = require('sanitize-html');
// var cookie = require('cookie');
// const { res } = require('express');

// const authIsOwner = (req, res) => {
//   var isOwner = false;
//   var cookies = {};
//   if(req.headers.cookie){
//     cookies = cookie.parse(req.headers.cookie);
//   }
//   if(cookies.email === 'stay@naver.com' && cookies.password === '1111'){
//     isOwner = true;
//   }
//   return isOwner;
// };

// const authStatusUI = (request, res) => {
//   var authStatusUI = '<a href="/login">login</a>';
//   if(authIsOwner(request, res)){
//     authStatusUI = '<a href="/logout_process">logout</a>';
//   }
//   return authStatusUI;
// }

// var app = http.createServer(function(request,res){
//     var _url = request.url;
//     var queryData = url.parse(_url, true).query;
//     var pathname = url.parse(_url, true).pathname;
    
    
//     if(pathname === '/'){
//       if(queryData.id === undefined){
//         fs.readdir('./data', function(error, filelist){
//           var title = 'Welcome';
//           var description = 'Hello, Node.js';
//           var list = template.list(filelist);
//           var html = template.HTML(title, list,
//             `<h2>${title}</h2>${description}`,
//             `<a href="/create">create</a>`,
//             authStatusUI(request, res)
//           );
//           res.writeHead(200);
//           res.end(html);
//         });
//       } else {
//         fs.readdir('./data', function(error, filelist){
//           var filteredId = path.parse(queryData.id).base;
//           fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
//             var title = queryData.id;
//             var sanitizedTitle = sanitizeHtml(title);
//             var sanitizedDescription = sanitizeHtml(description, {
//               allowedTags:['h1']
//             });
//             var list = template.list(filelist);
//             var html = template.HTML(sanitizedTitle, list,
//               `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
//               ` <a href="/create">create</a>
//                 <a href="/update?id=${sanitizedTitle}">update</a>
//                 <form action="delete_process" method="post">
//                   <input type="hidden" name="id" value="${sanitizedTitle}">
//                   <input type="submit" value="delete">
//                 </form>`
//             );
//             res.writeHead(200);
//             res.end(html);
//           });
//         });
//       }
//     } else if(pathname === '/create'){
//       if(authIsOwner(request, res) === false){
//         res.end('Login required !!');
//         return false;
//       }
//       fs.readdir('./data', function(error, filelist){
//         var title = 'WEB - create';
//         var list = template.list(filelist);
//         var html = template.HTML(title, list, `
//           <form action="/create_process" method="post">
//             <p><input type="text" name="title" placeholder="title"></p>
//             <p>
//               <textarea name="description" placeholder="description"></textarea>
//             </p>
//             <p>
//               <input type="submit">
//             </p>
//           </form>
//         `, authStatusUI(request, res));
//         res.writeHead(200);
//         res.end(html);
//       });
//     } else if(pathname === '/create_process'){
//       if(authIsOwner(request, res) === false){
//         res.end('Login required !!');
//         return false;
//       }
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           var post = qs.parse(body);
//           var title = post.title;
//           var description = post.description;
//           fs.writeFile(`data/${title}`, description, 'utf8', function(err){
//             res.writeHead(302, {Location: `/?id=${title}`});
//             res.end();
//           })
//       });
//     } else if(pathname === '/update'){
//       if(authIsOwner(request, res) === false){
//         res.end('Login required !!');
//         return false;
//       }
//       fs.readdir('./data', function(error, filelist){
//         var filteredId = path.parse(queryData.id).base;
//         fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
//           var title = queryData.id;
//           var list = template.list(filelist);
//           var html = template.HTML(title, list,
//             `
//             <form action="/update_process" method="post">
//               <input type="hidden" name="id" value="${title}">
//               <p><input type="text" name="title" placeholder="title" value="${title}"></p>
//               <p>
//                 <textarea name="description" placeholder="description">${description}</textarea>
//               </p>
//               <p>
//                 <input type="submit">
//               </p>
//             </form>
//             `,
//             `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,authStatusUI(request, res)
//           );
//           res.writeHead(200);
//           res.end(html);
//         });
//       });
//     } else if(pathname === '/update_process'){
//       if(authIsOwner(request, res) === false){
//         res.end('Login required !!');
//         return false;
//       }
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           var post = qs.parse(body);
//           var id = post.id;
//           var title = post.title;
//           var description = post.description;
//           fs.rename(`data/${id}`, `data/${title}`, function(error){
//             fs.writeFile(`data/${title}`, description, 'utf8', function(err){
//               res.writeHead(302, {Location: `/?id=${title}`});
//               res.end();
//             })
//           });
//       });
//     } else if(pathname === '/delete_process'){
//       if(authIsOwner(request, res) === false){
//         res.end('Login required !!');
//         return false;
//       }
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           var post = qs.parse(body);
//           var id = post.id;
//           var filteredId = path.parse(id).base;
//           fs.unlink(`data/${filteredId}`, function(error){
//             res.writeHead(302, {Location: `/`});
//             res.end();
//           })
//       });
//     } else if(pathname === '/login'){
//       fs.readdir('./data', function(error, filelist){
//         var title = 'Login';
//         var description = 'Hello, Node.js';
//         var list = template.list(filelist);
//         var html = template.HTML(title, list,
//           `
//           <form action="login_process" method="post">
//             <p><input type="text" name="email" placeholder="email"></p>
//             <p><input type="password" name="password" placeholder="password"></p>
//             <p><input type="submit"></p>
//             </form>`,
//           `<a href="/create">create</a>`
//         );
//         res.writeHead(200);
//         res.end(html);
//       });
//     }else if(pathname === '/login_process'){
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//           var post = qs.parse(body);
//           if(post.email === 'stay@naver.com' && post.password === '1111'){
//             res.writeHead(302, {
//               'Set-Cookie': [
//                 `email=${post.email}`,
//                 `password=${post.password}`,
//                 `nickname=stay`
//               ],
//               Location: `/`
//             });
//             res.end();
//           }else{
//             res.end('Who?');  
//           }
//       });
//     } else if(pathname === '/logout_process'){
//       var body = '';
//       request.on('data', function(data){
//           body = body + data;
//       });
//       request.on('end', function(){
//         var post = qs.parse(body);
//           res.writeHead(302, {
//             'Set-Cookie': [
//               `email=; Max-Age=0`,
//               `password=; Max-Age=0`,
//               `nickname=; Max-Age=0`
//             ],
//             Location: `/`
//           });
//           res.end();
//       });
//     } else {
//       res.writeHead(404);
//       res.end('Not found');
//     }
// });
// app.listen(3000);
