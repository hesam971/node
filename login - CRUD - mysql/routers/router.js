const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

// databse config
const mysql = require('../util/database');

router.get('/',(req,res,next) => {
    res.render('register');
});

router.post('/login',(req,res,next) => {
    const {username,email,password,confirmPassword} = req.body;
    const error = [];
    if(!username || !email || !password || !confirmPassword){
        error.push({msg:'fill all the inputs'});
        res.status(400).render('register',{error});
    }else if(password != confirmPassword){
        error.push({msg:'password are not same'});
        res.status(400).render('register',{error});
    }else if(password.length < 6){
        error.push({msg:'password should be 8 character'});
        res.status(400).render('register',{error});
    }else{
        bcrypt.hash(password,10,(errors,hash) => {
            if(errors){
                throw errors;
            }else{
                mysql.query("SELECT * FROM `register-form` WHERE email=?",[email],(err,result) => {
                    if(err){
                        throw err;
                    }else if(result.length > 0){
                        error.push({msg:'email is already exist'});
                        res.status(400).render('register',{error});
                    }else{
                        const query = {username:username,email:email,password:hash};
                        mysql.query("INSERT INTO `register-form` SET ?",query,(error,results) => {
                            if(err){
                                throw error;
                            }else{
                                res.status(200).render('login');
                                console.log(results)
                            }
                        })
                    }
                })
            }
        })
    }
});

router.get('/login',(req,res,next) => {
    res.status(200).render('login');
});

router.post('/dashbord',(req,res,next) => {
    const {email,password} = req.body;
    const error = [];
    if(!email || !password){
        error.push({msg:'fill all the inputs'})
        res.status(400).render('login',{error})
    }else{
        mysql.query("SELECT * FROM `register-form` WHERE email=?",[email],(err,result) => {
            if(err){
                throw err;
            }else if(!result.length){
                error.push({msg:'email is not exist'});
                res.status(400).render('login',{error});
            }else{
                bcrypt.compare(password,result[0]['password'],(errors,match) => {
                    if(errors || !match){
                        error.push({msg:'password is wrong'});
                        res.status(400).render('login',{error});
                    }else if(match){
                        mysql.query("SELECT * FROM `api`",(err,resu) => {
                            if(err){
                                throw err;
                            }else{
                                res.status(200).render('dashbord',{data:resu});
                            }
                        })
                    }
                })
            }
        })
    }
});

// CRUD config

router.get('/dashbord',(req,res,next) => {
    mysql.query("SELECT * FROM `api`",(err,resu) => {
        if(err){
            throw err;
        }else{
            res.status(200).render('dashbord',{data:resu});
        }
    })
});


router.post('/post',(req,res,next) => {
    const {Firstname,Lastname,Email} = req.body;
    const query = {firstname:Firstname,lastname:Lastname,email:Email};
    mysql.query("SELECT * FROM `register-form` WHERE email=?",[Email],(error,result) => {
        if(error){
            throw error;
        }else{
                mysql.query("INSERT INTO `api` SET ?",query,(errors) => {
                    if(errors){
                        throw errors;
                    }else{
                        res.redirect('/dashbord')
                    }
                })
            }
    })
});

router.delete('/delete/:id',(req,res,next) => {
    const data = req.params.id;
    mysql.query('DELETE FROM api WHERE id = ?',[data],(err) => {
        if(err){
            throw err;
        }else{
            res.sendStatus(200)
        }
    })
});

router.get('/edit-dashbord/:id',(req,res,next) => {
    mysql.query("SELECT * FROM `api` WHERE id = ?",req.params.id,(err,resu) => {
        if(err){
            throw err;
        }else{
            res.status(200).render('editDashbord',{data:resu});
        }
    })
});

router.post('/update/:id',(req,res,next) => {
    const {Firstname,Lastname,Email} = req.body;
    const query = {firstname:Firstname,lastname:Lastname,email:Email};
    mysql.query("UPDATE `api` SET ? WHERE id="+ req.params.id,query,(err) => {
        if(err){
            throw err;
        }else{
            res.redirect('/dashbord')
        }
    })
});


module.exports = router;

