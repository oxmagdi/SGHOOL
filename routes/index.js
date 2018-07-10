var express = require('express');
var router = express.Router();
const mysql = require('mysql'),
      conn = mysql.createConnection({
        host     : 'localhost',
        user     : 'migzz',
        password : 'migzz',
        database : 'school'
      });


/* GET home page. */
router.get('/',(req, res, next)=>{
  //console.log(req.session.email);
  res.render('login', { title: 'Express' });
});

/* GET home page. */
router.post('/',(req, res, next)=>{
 
  const email = req.body.email,
        pass = req.body.pwd;

  let sql = "SELECT * FROM `students` WHERE email= ?";
  let query = conn.query(sql,[email],(err,result)=>{
  if(err) throw err;
  // handel data from db as object
  Object.keys(result).forEach((key)=> {
    var row1 = result[key];

    if(row1.pwd === pass) {

         req.session.email = email;
         req.session.name = row1.name;
         req.session.pass = pass;
        //  console.log(req.session.email );

        
        
    }
    // else res.redirect('/');
  });

    if(req.session.name){
          let query = conn.query("SELECT * From `images` WHERE email=?",
          [email],
          (err,result)=>{
          if(err) res.redirect('/users/home');

          if(result.length)req.session.imgUrl = result[0].img;
          res.redirect('/users/home');
          });
    }
  
  });

});

module.exports = router;
