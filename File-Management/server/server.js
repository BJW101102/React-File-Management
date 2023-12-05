const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
})
const uploads = multer({ storage: storage })
const uploadedFiles = [];


//Post Route to posting to the uploads folder
app.post("/uploads", uploads.array("files"), async (req, res) => {
    console.log(req.files);
    const files = req.files;
    files.forEach(file => {
        uploadedFiles.push({
          name: file.originalname,
          sizeofFile: file.size,
        });
      });
      uploadedFiles.forEach(file => {
        console.log(`File "${file.name}" has length: ${file.fileSize} bytes`);
    });
    res.json({ status: "File Received" });
});

//Get Route for All Files in Upload Folder
app.get("/files", async (req, res) => {
    const dirPath = __dirname + "/uploads";
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Error reading directory" });
        }
        res.json({ files: files });
    });
});


// Get Route for downloading desired file
app.get("/download/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = __dirname + "/uploads/" + filename;
    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).json({ error: "Error downloading file" });
            }
        });
    } else {
        res.status(404).json({ error: "File not found" });
    }
});


//Delete Route for deleting desired file
app.delete("/delete/:filename", async (req, res) => {
    const { filename } = req.params;
    const filePath = __dirname + "/uploads/" + filename;

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error deleting file" });
        }
        res.json({ status: "File deleted successfully" });
    });
})

app.get("/filesize/:filename", (req, res) => {
    const { filename } = req.params;
    const filePath = __dirname + "/uploads/" + filename;
    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Get file stats to retrieve the size
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        console.log("The File Size is: ", fileSizeInBytes);
        res.json({ filename, fileSizeInBytes });
    } else {
        // File not found
        res.status(404).json({ error: "File not found" });
    }
});




app.listen(5000, function () {
    console.log("Server running on port 5000");
});
