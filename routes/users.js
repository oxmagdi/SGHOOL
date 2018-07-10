var express = require('express');
var router = express.Router();
var print = console.log;

const mysql = require('mysql'),
      conn = mysql.createConnection({
        host     : 'localhost',
        user     : 'migzz',
        password : 'migzz',
        database : 'school',
        multipleStatements:true
      });
    
const path = require('path');       
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
  }
});
const upload = multer({
  storage:storage,
  fileFilter:(req,file,cb)=>{
    
        // allow extention
        const fileTypes = /jpeg|jpg|png|gif/;

        // check ext
        const extName = fileTypes.
                         test(path.extname(file.originalname).
                         toLowerCase());
        
        //check mimetype
        const mimeType = fileTypes.test(file.mimetype);
         
        if(extName && mimeType) return cb(null,true);
        else  cb("ERROR : File Must Have One Of This Extentions (jpeg,jpg,png,gif)")
    
  }
}).single('img');


// var mongojs = require('mongojs');
// var db = mongojs('students', ['students']);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/*****************************************************************/

router.get('/logout', function(req, res, next) {
  req.session.destroy((err)=>{
     if(err) throw err;
     res.redirect('/');
  });
});

/*****************************************************************/

router.get('/register', function(req, res, next) {
  res.render('register');
});

/*****************************************************************/

router.get('/home', function(req, res, next) {
  let email = req.session.email,
      image = req.session.imgUrl;
      print('image:'+image );
  var obj = {};
  if(email){
    let sql = "SELECT * FROM `subjects` WHERE email=?";
    let query = conn.query(sql,[email],(err,result)=>{
           if(err) throw err;
           Object.keys(result).forEach((key)=>{
             let row = result[key];
             obj = {
              arabic:      row.arabic,
              english:     row.english,
              math:        row.math,
              art:         row.art,
              religion:    row.religion,
              grammar:     row.grammar,
              literature:  row.literature,
              chemistry:   row.chemistry,
              physics:     row.physics,
              biology:     row.biology
             }; 
           });
           
           res.render('home',{
             subjs:obj,
             img:image
          });
    });

  }

});

router.get('/profile', function(req, res, next) {
  res.render('profile',{
            name:  req.session.name,
            email: req.session.email
         });
});

/*****************************************************************/

router.get('/dashboard', function(req, res, next) {
   var students = [];
   let sql = "SELECT * FROM `students`";
   let query = conn.query(sql,(err,result)=>{
     if(err) throw err;

     Object.keys(result).forEach((key)=> {
     
      var row = result[key];
        students.push({
          email:row.email,
          name:row.name,
          pwd:row.pwd,
          editUrl:'/users/editstudent/'+row.email+'/'+row.name,
          delUrl:'/users/delstudent/'+row.email
        });
     });
    //  print(students);
     res.render('dashboard',{students:students});
   });

 
});

router.get('/delstudent/:email', function(req, res, next) {
      
    let email = req.params.email;
    let sql = 'DELETE FROM `students` WHERE email= ? ';
    let query = conn.query(sql,[email],(err,result)=>{
      if(err){ 
        throw err; 
      }
      let sql2 = 'DELETE FROM `subjects` WHERE email= ?';
      let query2 = conn.query(sql2,[email],(err,result)=>{
        if(err) throw err;
      });
      
    });
    res.redirect('/users/dashboard');
    

});

router.get('/editstudent/:email/:name', function(req, res, next) {
  
  const email = req.params.email;
        name = req.params.name,
        subjs = {};
  let query = conn.query('SELECT * FROM `subjects` WHERE email=?',
                         [email],
                         (err,result)=>{
        if(err){
          res.render('edit',{
            email:email,
            name:name
          });
        }else if(result.length){
          Object.keys(result).forEach((key)=> {
     
            var row = result[key];
             subjs ={  
                  arabic:      row.arabic,
                  english:     row.english,
                  math:        row.math,
                  art:         row.art,
                  religion:    row.religion,
                  grammar:     row.grammar,
                  literature:  row.literature,
                  chemistry:   row.chemistry,
                  physics:     row.physics,
                  biology:     row.biology 
             }
           });
          res.render('edit',{
            email:email,
            name:name,
            subjs:subjs
          });
        }
  });      


});

/******************************************************************/

router.get('/uploads', function(req, res, next) {
  
  res.render('upload',{img:req.session.imgUrl});

});

/*****************************************************************/

// POST'S
router.post('/register',(req, res, next)=>{
    let name = req.body.name,
        email = req.body.email,
        pwd = req.body.pwd,
        pwd2 = req.body.pwd2,
        
        check = req.check;


        /* check form */
        check('name','Name Field Is required..').notEmpty();
        check('email','Email Field Is required..').notEmpty();
        check('pwd','Password Field Is required..').notEmpty();
        check('pwd2','Passwords Not Matches..').equals(pwd);

        // order important , errors come after check 
        var errors = req.validationErrors();
        
        if(!errors.isEmpty()){ 
          res.render('register',{
            errors:errors
          });
        }else{
          // add user
          let student={
            email:email,
            name:name,
            pwd:pwd
          };
          let sql = 'INSERT INTO students SET ? ';
          let query = conn.query(sql,student,(err,result)=>{
            if(err) throw err;
            print('student added ..');
            res.redirect("/");
          });
        }

        //  print('Name: '+name+' -Email: '+email+' -PWD: '+pwd);

});


/*****************************************************************/
router.post('/profile',(req, res, next)=>{
  let name = req.body.name,
      email = req.body.email,
      pwd = req.body.pwd,
      pwd2 = req.body.pwd2,
      
      check = req.checkBody;


      /* check form */
      check('name','Name Field Is required..').notEmpty();
      check('email','Email Field Is required..').notEmpty();
      check('pwd','Password Field Is required..').notEmpty();
      check('pwd2','Passwords Not Matches..').equals(pwd);

      // order important , errors come after check 
      var errors = req.validationErrors();
      
      if(errors){ 
        res.render('profile',{
          err:errors
        });
      }else{

        let sql = 'UPDATE students SET name=?,pwd = ? WHERE email= ? ';
        let query = conn.query(sql,[name,pwd,email],(err,result)=>{
          if(err) throw err;
          print('profile updated ..');
          res.redirect("/users/profile");
        });
      }

      //  print('Name: '+name+' -Email: '+email+' -PWD: '+pwd);

});

/********************************************************/
router.post('/editstudent/:email/:name',(req, res, next)=>{
  var 
      email = req.params.email,
      name = req.params.name,    

      arabic = req.body.arabic,
      english = req.body.english,
      math = req.body.math,
      art = req.body.art,
      religion = req.body.religion,
      grammar = req.body.grammar,
      literature = req.body.literature,
      chemistry = req.body.chemistry,
      physics = req.body.physics,
      biology = req.body.biology,
      
      check = req.checkBody;


      /* check form */
      check('arabic','Arabic Field Is required..').notEmpty();
      check('english','English Field Is required..').notEmpty();
      check('math','Math Field Is required..').notEmpty();
      check('art','Art Not Matches..').notEmpty();
      check('religion','Religion Field Is required..').notEmpty();
      check('grammar','Grammar Field Is required..').notEmpty();
      check('literature','Literature Field Is required..').notEmpty();
      check('chemistry','Chemistry Not Matches..').notEmpty();
      check('physics','Physics Field Is required..').notEmpty();
      check('biology','Biology Field Is required..').notEmpty();

      // order important , errors come after check 
      var errors = req.validationErrors();
      
      if(errors){ 
        res.render('/editstudent/'+email+'/'+name,{
          err:errors
        });
      }else{
 
        let searchSql='SELECT * FROM `subjects` WHERE email=?';
        let searchQuery = conn.query(searchSql,[email],(err,results)=>{
          if(err){
            print("throw err");
            throw err;
          }
          print('search done..');
          if(results.length){
            print("found");
            // The username already exists
 
            let query = conn.query("UPDATE `subjects` SET ? WHERE `email`=? ",
                                    [{
                                      arabic:parseInt(arabic),
                                      english:parseInt(english),
                                      math:parseInt(math),
                                      art:parseInt(art),
                                      religion:parseInt(religion),
                                      grammar:parseInt(grammar),
                                      literature:parseInt(literature),
                                      chemistry:parseInt(chemistry),
                                      physics:parseInt(physics),
                                      biology:parseInt(biology)
                                    },email],
                                    (err,result)=>{
              if(err) print(err.code);
              print('update done ..');
            });

          }else{
            print("not found");
            // The username wasn't found in the database
            let marks2 = {
              email:email,
              arabic:parseInt(arabic),
              english:parseInt(english),
              math:parseInt(math),
              art:parseInt(art),
              religion:parseInt(religion),
              grammar:parseInt(grammar),
              literature:parseInt(literature),
              chemistry:parseInt(chemistry),
              physics:parseInt(physics),
              biology:parseInt(biology)
            };
             
            
            let query = conn.query('INSERT INTO `subjects` SET ? ',
                                    {
                                      email:email,
                                      arabic:parseInt(arabic),
                                      english:parseInt(english),
                                      math:parseInt(math),
                                      art:parseInt(art),
                                      religion:parseInt(religion),
                                      grammar:parseInt(grammar),
                                      literature:parseInt(literature),
                                      chemistry:parseInt(chemistry),
                                      physics:parseInt(physics),
                                      biology:parseInt(biology)
                                    },
                                  (err,result)=>{
              if(err) console.log(err.code);
              print('adding done ..');
              
            });

          }
        });
      }

      res.redirect("/users/dashboard");

});

/****************************************************************/
router.post('/uploads', function(req, res, next) {
  
  upload(req,res,(err)=>{

    if(err){
      res.render("upload",{
        err:err
      });
    }else{
       if(req.file == undefined){
        res.render("upload",{
          err:'No Image Is Selected..'
        });
       }else{
              
         const fName = req.file.filename ,
               email = req.session.email,
               sql='SELECT * FROM `images` WHERE email=?';

               req.session.imgUrl = fName;

         let query = conn.query(sql,[email],(err,results)=>{
           if (err) throw err;
           
           if(results.length){
             //update
             let query = conn.query("UPDATE `images` SET `img`=? WHERE `email`=?",
                                    [fName,email],
                                    (err,result)=>{
               if(err) throw err;
               print('updated..');
               res.render("upload",{
                 img:fName
               });
             });
           }

           else{
             //insert
             let query = conn.query("INSERT INTO `images` SET ?",
                                     {email:email,img:fName},
                                     (err,result)=>{
              if(err) throw err;
             
              print('added..');
              res.render("upload",{
                img:fName
              });

             });
           
             
           }

         });

       }
    }

  });
});

module.exports = router;
