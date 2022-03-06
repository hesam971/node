const mongoose = require('mongoose');

const pdfUploader = new mongoose.Schema({
    pdfUploader: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('pdfUploader',pdfUploader);