const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();
const mongoose = require('../util/databse');
const User = require('../util/schema');
const Crud = require('../util/crudSchema');

router.get('/',(req,res,next) => {
    res.status(200).render('register')
});

router.post('/login',(req,res,next) => {
    const {username,lastname,email,password,passwordconfirm} = req.body;
    const error =[];
    if(!username || !lastname || !email || !password){
        error.push({msg:'fill all the inputs'});
        res.status(400).render('register',{error});
    }else if(password != passwordconfirm){
        error.push({msg:'both password should be same'});
        res.status(400).render('register',{error});
    }else if(password.length < 6){
        error.push({msg:'password should be 8 charachter'});
        res.status(400).render('register',{error});
    }else{
        User.findOne({email:email},function(err,result){
            if(err){
                throw err;
            }else if(result){
                error.push({msg:'email is already exist'});
                res.status(400).render('register',{error});
            }else{
                bcrypt.hash(password,10,function(err,hash){
                    if(err){
                        throw err;
                    }else{
                        const newUser = new User({username:username,lastname:lastname,email:email,password:hash});
                        User.insertMany(newUser).
                        then(res.status(200).render('login')).
                        catch((err) => {throw err});
                    }
                })
            }
        })
    }
});

router.get('/login',(req,res,next) => {
    res.status(200).render('login');
});

router.post('/dashboard',(req,res,next) => {
    const {email,password} = req.body;
    if(!email || !password){
        res.render('login',{error:'fill all the inputs'});
    }else{
        User.findOne({email:email},function(err,result){
            if(err || !result){
                res.status(400).render('login',{error:'email is not exist in database'});
            }else{
                bcrypt.compare(password,result['password'],function(error,results){
                    if(error || !results){
                        res.status(400).render('login',{error:'password is not exist'});
                    }else if(results){
                        Crud.find({},(errors,resu) => {
                            if(errors){
                                throw errors;
                            }else{
                                res.render('dashboard',{resu:resu});
                            }
                        })
                    }
                })
            }
        })
    }
});

// todo list routers

router.get('/dashboard',(req,res,next) => {
    Crud.find({},(errors,resu) => {
        if(errors){
            throw errors;
        }else{
            res.render('dashboard',{resu:resu});
        }
    })
});

router.post('/dashboard/add',(req,res,next) => {
    Crud.find({},(errors,resu) => {
        if(errors){
            throw errors;
        }else{
            const {todo} = req.body;
            if(!todo){
                res.render('dashboard',{resu:resu,error:'you have to fill the input'});
            }else{
                const newTodo = new Crud({todoName:todo});
                Crud.insertMany(newTodo).
                then(res.redirect('/dashboard')).
                catch(err => {throw err});
            }
        }
    })
});

router.delete('/delete/:id',(req,res,next) => {
    Crud.deleteOne({_id:req.params.id},function(err){
        if(err){
            throw err;
        }else{
            res.sendStatus(200);
        }
    })
});

router.get('/editDashboard/:id',(req,res,next) => {
    Crud.find({_id:req.params.id},function(err,result){
        if(err){
            throw err;
        }else{
            res.render('editDashboard',{resu:result});
        }
    })
});

router.post('/dashboard/add/:id',(req,res,next) => {
        const {todo} = req.body;
        const updateTodo = {todoName:todo};
        Crud.updateOne({_id:req.params.id},{$set:updateTodo},function(err,result){
            if(err){
                console.log(result)
            }else{
                res.redirect('/Dashboard');
            }
        })
});

module.exports = router;