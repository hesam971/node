const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// database config
const mysql = require('../util/database');

router.get('/',(req,res,next) => {
    mysql.query("SELECT * FROM `create-article`",(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('home',{resu:result});
        }
    })
});

router.get('/contact',(req,res,next) => {
    res.render('contact-form');
});


router.post('/contact',(req,res,next)=>{
    const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
    <li>fullName: ${req.body.fullName}</li>
    <li>Email: ${req.body.email}</li>
    <li>phone-Nummber: ${req.body.mobileNo}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.comment}</p>
`;

  // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'email', // generated ethereal user
        pass: ''  // one time password generated ethereal password
    },
    tls:{
    rejectUnauthorized:false
    }
});

  // setup email data with unicode symbols
    let mailOptions = {
      from: '"Nodemailer Contact" <email>', // sender address
      to: 'reeceiver email', // list of receivers,
      subject: 'Node Contact Request', // Subject line
      text: 'request from customer', // plain text body
      html: output // html body
};

  // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('contact-form');
    });
})


router.get('/articlesTable',(req,res,next) => {
    mysql.query("SELECT * FROM `create-article`",(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('articlesTable',{resu:result});
        }
    })
});

router.get('/articles/:id',(req,res,next) => {
    mysql.query("SELECT * FROM `create-article` WHERE id="+ req.params.id,(err,result) => {
        if(err){
            throw err;
        }else{
            mysql.query("SELECT * FROM `comment-add`",(error,results) => {
                if(error){
                    throw error;
                }else{
                    res.render('oneArtic',{resu:result,menu:results});
                }
            })
        }
    })
});

router.post('/blog-add-comment/:id',(req,res,next) => {
    const {subject,name,email,body} = req.body;
    const query = {subject:subject,name:name,email:email,body:body};
    mysql.query("UPDATE `comment-add` SET addcomment = CONCAT(?)",query,(err) => {
        if(err){
            throw err;
        }else{
            mysql.query("SELECT * FROM `create-article` WHERE id="+ req.params.id,(err,result) => {
                if(err){
                    throw err;
                }else{
                    mysql.query("SELECT * FROM `comment-add`",(error,results) => {
                        if(error){
                            throw error;
                        }else{
                            res.render('oneArtic',{resu:result,menu:results});
                        }
                    })
                }
            })
        }
    })
})

router.get('/catagories',(req,res,next) => {
    mysql.query("SELECT * FROM `create-add-catagory`",(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('catagories',{resu:result});
        }
    })
});

router.get('/catagory/articles/:id',(req,res,next) => {
    mysql.query("SELECT * FROM `create-article` WHERE id="+req.params.id,(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('article-item',{resu:result});
        }
    })
});

router.get('/articles',(req,res,next) => {
    mysql.query("SELECT * FROM `create-article`",(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('articles',{resu:result});
        }
    })
});


router.get('/catagories-curd',(req,res,next) => {
    mysql.query("SELECT * FROM `create-add-catagory`",(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('catagories-curd',{resu:result});
        }
    })
});

router.post('/create-add-catagory',(req,res,next) => {
    const {title,description} = req.body;
    const query = {title:title,description:description};
    if(!title || !description){
        res.render('create-catagory',{error:'fill all the inputs'});
    }else{
        mysql.query("INSERT INTO `create-add-catagory` SET ?",query,(err) => {
            if(err){
                throw err;
            }else{
                res.redirect('/catagories-curd');
            }
        })
    }
});

router.get('/catagories-curd/:id',(req,res,next) => {
    mysql.query("SELECT * FROM `create-add-catagory` WHERE id="+req.params.id,(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('catagories-curd-edit',{resu:result});
        }
    })
});

router.delete('/delete-catagory/:id',(req,res,next) => {
    mysql.query("DELETE FROM `create-add-catagory` WHERE id="+req.params.id,(err) => {
        if(err){
            throw err;
        }else{
            res.sendStatus(200);
        }
    })
});

router.post('/catagories-curd-post/:id',(req,res,next) => {
    const {title,description} = req.body;
    const query = {title:title,description:description};
    mysql.query("UPDATE `create-add-catagory` SET ? WHERE id ="+ req.params.id,query,(err) => {
        if(err){
            throw err;
        }else{
            res.redirect('/catagories-curd');
        }
    })
});

router.get('/add-article',(req,res,next) => {
    mysql.query("SELECT * FROM `create-add-catagory`",(err,result) => {
        if(err){
            throw err;
        }else{
            res.render('add-article',{resu:result});
        }
    })
});

router.post('/add-article',(req,res,next) => {
    const {title,subtitle,author,body,catagory} = req.body;
    const query = {title:title,subtitle:subtitle,author:author,body:body,catagory:catagory};
    if(!title || !subtitle || !author || !body){
        mysql.query("SELECT * FROM `create-add-catagory`",(err,result) => {
            if(err){
                throw err;
            }else{
                res.render('add-article',{resu:result,error:'fill all the inputs'})
            }
        })
    }else{
        mysql.query("INSERT INTO `create-article` SET ?",query,(err) => {
            if(err){
                throw err;
            }else{
                res.redirect('/articles');
            }
        })
    }
});

router.get('/add-catagory',(req,res,next) => {
    res.render('create-catagory')
});

router.get('/edit-article/:id',(req,res,next) => {
    mysql.query("SELECT * FROM `create-article` WHERE id ="+ req.params.id,(err,result) => {
        if(err){
            throw err;
        }else{
            mysql.query("SELECT * FROM `create-add-catagory`",(error,results) => {
                if(error){
                    throw error;
                }else{
                    res.render('edit-article',{resu:result,menu:results});
                }
            })
        }
    })
});

router.delete('/delete-article/:id',(req,res,next) => {
    mysql.query("DELETE FROM `create-article` WHERE id="+req.params.id,(err) => {
        if(err){
            throw err;
        }else{
            res.sendStatus(200);
        }
    })
});

router.post('/update-article/:id',(req,res,next) => {
    const {title,subtitle,author,body,catagory} = req.body;
    const query = {title:title,subtitle:subtitle,author:author,body:body,catagory:catagory};
    mysql.query("UPDATE `create-article` SET ? WHERE id ="+ req.params.id,query,(err) => {
        if(err){
            throw err;
        }else{
            res.redirect('/articles');
        }
    })
});

module.exports = router;