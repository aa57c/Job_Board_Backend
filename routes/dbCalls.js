const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const upload = require('express-fileupload');

const User = require('../userModel/User');

//load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

 
// This will help us connect to the database
//
const dbo = require("../db/connection");

recordRoutes.route('/register').post((req, res) => {
  const {errors, isValid} = validateRegisterInput(req.body);

  if(!isValid){
    return res.status(400).json(errors);
  }
  dbo.getDB().collection('Logins').findOne({email: req.body.email}).then(user => {
    if(user){
      return res.status(400).json({email: 'Email already exists'});
    }
    else{
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        isAdmin: req.body.isAdmin
      })

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          newUser.password = hash;
          dbo.getDB().collection('Logins').insertOne(newUser)
          .then(user => res.json(user))
          .catch(err => console.log(err));
        });
      });
    }
  });
});


recordRoutes.route('/login').post((req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }
  
    const email = req.body.email;
    const password = req.body.password;

    dbo.getDB().collection('Logins').findOne({email}).then(user => {
      if(!user){
        return res.status(404).json({emailnotfound: "Email not found"});
      }
      bcrypt.compare(password, user.password).then(isMatch => {
        if(isMatch){
          const payload = {
            id: user.id,
            name: user.name
          };
          jwt.sign(
            payload,
            keys.secretOrKey,
            {
              expiresIn: 31556926
            },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer: " + token
              });
            }
          );
        }
        else{
          return res.status(400).json({passwordincorrect: "Password is incorrect"});
        }
      });
    });
});

recordRoutes.route('/update-posting').post((req, res) => {
  dbo.getDB().collection('Classes').updateOne(
    {className: req.body.class, sectionID: req.body.section, postings: {}},
    {$set: {"postings.$[i]": {"job_title": req.body.job, "GTA_CERT": Boolean(req.body.isGTARequired), "Applicants": [""]}}},
    {arrayFilters: [{i: {$eq: {}}}]}

  );
  res.json({status: "created posting when class already existed"})
})

recordRoutes.route('/create-posting').post((req, res) => {
  //console.log(req.body);
  let entry = {};
  if(req.body.job === "GTA"){
    console.log("posting is for a GTA");
    entry = {"className" : req.body.class, "sectionID": req.body.section, "createdBy": req.body.admin, "postings" : [{"job_title": req.body.job, "GTA_CERT": Boolean(req.body.isGTARequired), "Applicants": [""]}, {}]};
  }
  else if(req.body.job === "Grader"){
    console.log("posting is for a Grader");
    entry = {"className" : req.body.class, "sectionID": req.body.section, "createdBy": req.body.admin, "postings" : [{}, {"job_title": req.body.job, "GTA_CERT": Boolean(req.body.isGTARequired), "Applicants": [""]}]};

  }
  dbo.getDB().collection('Classes').insertOne(entry, (err, result) => {
    if(err){throw err};
    res.json(result);
    console.log("posting created!");
  })
  

})

recordRoutes.route('/users').get((req, res) => {
  dbo.getDB().collection('Logins').aggregate([{$project: {_id: 0, name: 1, email: 1, isAdmin: 1}}]).toArray((err, result) => {
    if(err){
      throw err;
    }
    res.json(result);
  });
});


recordRoutes.route('/home').get((req, res) => {
    
    //Serves the classes on request.
    dbo.getDB().collection('Classes').aggregate([{$project: {_id: 0, className: 1, sectionID: 1}}]).toArray((err, result) =>{
        if(err){
            throw err;
        }
        res.json(result);  
    });
});

//Recovers postings from the database.
recordRoutes.route('/postings').get((req, res) => {

    //Serves the collection of postings
    dbo.getDB().collection('Classes').aggregate([{$project: { 
        _id: 0, 
        className: 1,
        postings: 
        {
            job_title: 1, 
            GTA_CERT: 1
        }
    }}]).toArray((err, result) => {
        if(err){
            throw err;
        }
        res.json(result);
    });
});

recordRoutes.route('/find-class').get((req, res) => {
  dbo.getDB().collection('Classes').find(
    {
      className: req.query.class, sectionID: req.query.section
    }, {className: 1, sectionID: 1, postings: {job_title: 1, GTA_CERT: 1}}
  ).toArray((err, result) => {
    if(err){
      throw err;
    }
    res.json(result);
  })
})

recordRoutes.route('/user_applications').get((req, res) => 
{
  dbo.getDB().collection('Classes').find(
  {

    'postings.Applicants': {$elemMatch: {applicant: req.query.user}}

  }, {className: 1, postings: {job_title: 1, GTA_CERT: 1}}).toArray((err, result) => {
    if(err){
      throw err;
    }
    console.log(result)
    res.json(result);
  })
  
}
);

// Accepts file from front end and uploads to database.
recordRoutes.route('/applicants').post(upload({createParentPath: true}),
    (req, res) => 
    {
        dbo.getDB().collection('Classes').updateOne(
            {sectionID: req.body.Section, className: req.body.Class, postings: {$elemMatch: {job_title: req.body.Job}}},
            {$push: {'postings.$.Applicants': {resume: req.files, applicant: req.body.Applicant}}}
        )

        res.json({status: 'logged', message: 'logged'})
    }
);



module.exports = recordRoutes;
