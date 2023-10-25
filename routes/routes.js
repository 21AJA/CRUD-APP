const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const path = require("path");

// Create an "uploads" folder if it doesn't exist
const uploadDirectory = path.join('uploads');
const fs = require("fs");
const users = require("../models/users");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
  res.redirect('/');
}

// Custom function to generate a unique filename
const generateFilename = (file) => {
  const timestamp = Date.now();
  const extname = path.extname(file.originalname);
  return `file_${timestamp}${extname}`;
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, generateFilename(file));
  },
});

// Custom error handling for file uploads
const fileFilter = (req, file, cb) => {
  // Check file type (e.g., allow only image files)
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Invalid file type"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit (adjust as needed)
  },
}).single("image");
router.post("/add", upload, async (req, res) => {
  if (req.file) {
    // File uploaded successfully
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      Image: req.file.filename,
    });
    try {
      await user.save(); // Save the user to the database
      return res.status(200).json({ message: "User added successfully" } && res.redirect('/'));
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(400).json({ error: "No file uploaded" });
  }
});

  

router.get("/", (req, res) => {
  User.find()
    .exec()
    .then(users => {
      res.render("index", { title: "Home page", users: users });
    })
    .catch(err => {
      res.json({ message: err.message });
    });
});


router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add users" });
});
router.post('/update/:id', upload, async (req, res) => { 
  let id = req.params.id; 
  let new_image = ""; 

  if(req.file){
    new_image= req.file.filename;
    try{
      fs.unlinkSync("./uploads/"+ req.body.old_image);
    }catch(err){
      console.log(err);
    }
  }else{
    new_image=req.body.old_image;
  }
  try {
    const result = await User.findByIdAndUpdate(id, {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      Image: new_image,
    }).exec();
    
    req.session.message = {
      type: 'success',
      message: 'User updated successfully',
    };
    
    res.redirect('/');
  } catch (err) {
    res.json({ message: err.message, type: 'danger' });
  }  
}); 
router.get('/edit/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).exec();

    if (!user) {
      res.redirect('/');
    } else {
      res.render('edit_users', {
        title: 'Edit User',
        user: user,
      });
    }
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});
router.get("/delete/:id", (req, res) => {
  let id = req.params.id;
  User.findByIdAndRemove(id)
    .then((result) => {
      if (result && result.Image !== "") {
        try {
          fs.unlinkSync("./uploads/" + result.Image);
        } catch (err) {
          console.log(err);
        }
      }
      req.session.message = {
        type: "info",
        message: "User deleted successfully",
      };
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: err.message });
    });
});

module.exports = router;
