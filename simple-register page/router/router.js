const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

// database config
const mysql = require('../util/database');

router.get('/',(req,res,next) => {
    res.render('register');
});

router.post('/login',(req,res,next) => {
    const {username,email,password,confirmPassword} = req.body;
    const errors = [];
    if(!username || !email || !password || !confirmPassword){
        errors.push({msg:'fill all the inputs'});
        res.status(400).render('register',{errors});
    }else if(password.length < 6){
        errors.push({msg:'password should be 8 charachter'});
        res.status(400).render('register',{errors});
    }else if(confirmPassword.length < 6){
        errors.push({msg:'password should be 8 charachter'});
        res.status(400).render('register',{errors});
    }else if(password != confirmPassword){
        errors.push({msg:'password should be same'});
        res.status(400).render('register',{errors});
    }else{
        const emailValidation = 'SELECT * FROM form WHERE email = ?';
        mysql.query(emailValidation,[email],(err,result) => {
            if(err){
            throw err;
            }else if(result.length > 0){
                errors.push({msg:'email is already exist'});
                res.status(400).render('register',{errors});
            }else{
                bcrypt.hash(password,10, (error,hash) => {
                    if(error){
                        throw error;
                    }else{
                        const db = 'INSERT INTO form SET ?';
                        const query = {username:username,email:email,password:hash};
                        mysql.query(db,query,(er) => {
                            if(er){
                                throw er;
                            }else{
                                res.status(200).render('login');
                                console.log(query);
                            }
                        })
                    }
                })
            }
        })
    }
});

router.get('/login',(req,res,next) => {
    res.render('login');
});

router.post('/dashboard',(req,res,next) => {
    const {email,password} = req.body;
    const error = [];
    if(!email || !password){
        error.push({msg:'fill all the inputs'});
        res.status(400).render('login',{error});
    }else{
        const emailCheck = 'SELECT * FROM form WHERE email = ?';
        mysql.query(emailCheck,[email],(err,result) => {
            if(err){
                throw err;
            }else if(!result.length){
                error.push({msg:'email is not exist'});
                res.status(400).render('login',{error});
            }else{
                bcrypt.compare(password,result[0]['password'],(errors,match) =>{
                    if(errors || !match){
                        error.push({msg:'password is worng'});
                        res.status(400).render('login',{error});
                    }else if(match){
                        res.status(200).render('dashboard',{name:result[0]['username']});
                    }
                })
            }
        })
    }
})

module.exports = router;