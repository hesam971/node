const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
// mongoose config
const mongoose = require('mongoose');
const app = express();

// express body-parser
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(methodOverride('_method'));

// view engine
app.set('view engine','ejs');

const URL = 'mongo config';
const db = mongoose.createConnection(URL);
let gfs;

db.once('open', () => {
    /*gfs = Grid(db.db,mongoose.mongo);
    gfs.collection('uploads');*/
    gfs = new mongoose.mongo.GridFSBucket(db.db, {
        bucketName: "uploads"
    });
});

const storage = new GridFsStorage({
    url: URL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
            return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
        };
        resolve(fileInfo);
        });
    });
    }
});
    const upload = multer({ storage });

app.get("/", (req, res) => {
    if(!gfs) {
        console.log("some error occured, check connection to db");
        res.send("some error occured, check connection to db");
        process.exit(0);
    }
    gfs.find().toArray((err, files) => {
      // check if files
        if(!files || files.length === 0) {
            return res.render("home", {files: false});
        }else{
        const fileResult = files.map(file => {
            if(file.contentType === "image/png" || file.contentType === "image/jpeg" || file.contentType === "application/pdf"){
                file.isImage = true;
            }else{
                file.isImage = false;
            }
            return file;
            }).sort((a, b) => {
                return (new Date(b["uploadDate"]).getTime() - new Date(a["uploadDate"]).getTime());
            });
            return res.render("home", {files:fileResult});
        }
    });
});

app.post('/upload', upload.single('file') ,(req,res,next) => {
    res.redirect('/');
});

app.get('/image/:filename',(req,res,next) => {
    const file = gfs.find({filename: req.params.filename}).toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: "no files exist"
        });
    }
    gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});

app.post("/files/del/:id", (req, res) => {
    gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
        if (err) return res.status(404).json({ err: err.message });
        res.redirect("/");
    });
});

// express localhost
const PORT = process.env.PORT || 8080;
app.listen(PORT,() => console.log(`localhost connected at port ${PORT}`));