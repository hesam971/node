const express = require('express');

const app = express();

// express body-parser
app.use(express.urlencoded({extended:false}));

// view engine
app.set('view engine','ejs');

const router = require('./routers/router');
app.use('/',router);

// express localhost
const PORT = process.env.PORT || 8080;
app.listen(PORT,() => console.log(`localhost connected at port ${PORT}`));