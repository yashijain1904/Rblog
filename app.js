var express = require("express");
var methodOverride = require("method-override");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var LocalStrategy= require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User= require("./models/user");

var app= express();
mongoose.connect("mongodb://localhost/restful_blog_app",{ useNewUrlParser: true});
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(require("express-session")({
     secret: "i am yashi",
     resave : false,
     saveUninitialized: false

}));

app.use(function(req,res,next){
  res.locals.currentUser= req.user;
  next();
})

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



var blogSchema= new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {type: Date,default: Date.now},
  author: {
           id:{
           type: mongoose.Schema.Types.ObjectId,
           ref: "User"
           },
           username: String,
          }
});

var Blog= mongoose.model("Blog",blogSchema);


//INDEX ROUTE
app.get("/blogs",function(req,res){
   
  //take data from db
   Blog.find({},function(err,blogs){  
     if(err){console.log("error!!");}
     else{
      res.render("index",{blogs:blogs});}
     });
   });

//SHOW REGISTER FORM
app.get("/",function(req,res){
  res.render("register");
});

//HANDLING USER REGISTRATION
app.post("/",function(req,res){
   req.body.username
   req.body.password
   User.register(new User({username: req.body.username}),req.body.password,function(err,user){
    if(err){
      return res.render('register');}
    passport.authenticate("local")(req,res,function(){
      res.redirect("/blogs");
    });
   });
});

//LOGIN FORM
app.get("/login",function(req,res){
  res.render("login");
});

//CHECK LOGIN CREDENTIALS IE. USERNAME AND PASSWORD
app.post("/login",passport.authenticate("local",{
  successRedirect: "/blogs",
  failureRedirect: "/login"
}),function(req,res){
});

//LOG OUT ROUTE
app.get("/logout",function(req,res){
   req.logout();
   res.redirect("/");
});

//NEW ROUTE
app.get("/blogs/new",function(req,res){
  res.render("new");
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
  // create blog
  var title = req.body.blog[title];
  var image= req.body.blog[image];
  var body= req.body.blog[body];
  var author= {
    id: req.user._id,
    username: req.user.username};
    
    var newBlog1={title:title,image:image,body:body,author:author}

  Blog.create(newBlog1,function(err,newBlog){
    if(err){res.render("new");}
    else{
      console.log(newBlog);
      res.redirect("/blogs");
    }
  });
});

//SHOW ROUTE
app.get("/blogs/:id",function(req,res){
  Blog.findById(req.params.id,function(err, foundBlog){
    if(err){res.redirect("/blogs");}
    else{
      res.render("show",{blog:foundBlog});
    }
  });
  
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
  Blog.findById(req.params.id,function(err, foundBlog){
    if(err){res.redirect("/blogs");}
    else{
      if((foundBlog.author.id).equals(req.user._id))
      {
      res.render("edit",{blog:foundBlog});
      }
      else{res.send("YOU DO NOT HAVE PERMISSION");}
    }
  });
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
      if(err){res.redirect("/blogs");}
      else{
        res.redirect("/blogs/"+req.params.id);
      }
    });
});

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res)
{
  Blog.findByIdAndRemove(req.params.id,function(err){
    if(err){res.redirect("/blogs");}
    else{
      res.redirect("/blogs");
    }
  });
});

function isLoggedIn(req,res,next)
{
  if(req.isAuthenticated())
  {
     next();
  }
  else{
  res.redirect("/");}
}
app.listen(3000,function()
 {console.log("listen to 3000");
});
