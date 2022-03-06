const express = require('express');

const router = express.Router();

// mysql config
const mysql = require('../util/database');

router.get('/',(req,res,next) => {
    mysql.query('SELECT * FROM form',(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('firstPage',{result:result});
        }
    })
});

router.post('/post',(req,res,next) => {
    const {username,lastname,email} = req.body;
    const query = {username,lastname,email};
    mysql.query('INSERT INTO form SET ?',query,(err) => {
        if(err){
            throw err;
        }else{
            mysql.query('SELECT * FROM form',(error,result) => {
                if(error){
                    throw error;
                }else{
                    res.send({result:result});
                }
            })
        }
    })
});

router.delete('/delete/:id',(req,res,next) => {
    mysql.query(`DELETE FROM form WHERE id= ${req.params.id}`,(err) => {
        if(err){
            throw err;
        }else{
            res.sendStatus(200);
        }
    })
});

module.exports = router;