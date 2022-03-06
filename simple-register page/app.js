const express = require('express');

const app = express();

const router = require('./router/router');

// express body-parser
app.use(express.urlencoded({extended:false}));
app.use(express.json());

// router config
app.use('/',router);

// view enigene
app.set('view engine','ejs');

// localhost config
const PORT = process.env.PORT || 8080;

app.listen(PORT,() => console.log(`localhost connected at port ${PORT}`));