var express = require('express');
var router = express.Router();
var userHelper=require('../helper/userHelper');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('user/index')
});

router.get('/registerForm',(req,res)=>{
  res.render('user/registerForm')
})

router.post('/registerForm',(req,res)=>{
  userHelper.userRegisteration(req.body);
  res.redirect('/')
})

router.get('/loginForm',(req,res)=>{
  res.render('user/loginForm')
})


module.exports = router;
