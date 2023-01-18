import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { AuthMechanism } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';




mongoose.set("strictQuery", false);


const SECRET_KEY = 'secret-key';
const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true
    },
    lastName: {
        type: String,
        required: true
      },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    profilePicure: {
        type: String,
        required: false
      }
  });
const User = mongoose.model('User', userSchema, "Users");

const animalSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    hoursTrained: {
        type: Number,
        required: true
      },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false
    },
    dateOfBirth: {
      type: Date,
      required: false
    },
    profilePicure: {
        type: String,
        required: false
      }
  });
  const Animal = mongoose.model('Animal', animalSchema, "Animals");

  const trainingLogSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true
    },
    description: {
        type: String,
        required: true
      },
    hours: {
      type: Number,
      required: true,
    },
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: false
      },
    trainingLogVideo: {
        type: String,
        required: false
      }
  });
  const TrainingLog = mongoose.model('TrainingLog', trainingLogSchema, "Training Logs");
// Create a new user
async function connectToMongoDB() {
    try {
      await mongoose.connect('mongodb://0.0.0.0:27017/Info');
      console.log("Connected to MongoDB!");
    } catch (error) {
      console.log(error);
    }
  }

  
  
connectToMongoDB();



dotenv.config();
const app = express();
const APP_PORT = 3000;
app.use(cors({ origin: true }));
app.use(express.text({ type: "text/plain" }));
app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));




  function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded.payload;
        if(decoded.payload.exp < Date.now()/1000) {
            // the token is expired
            res.status(401).json({ message: 'Token has expired' });
            return;
          }
      } catch(err) {
        if (err instanceof jwt.JsonWebTokenError) {
          // the token is not valid
          res.status(401).json({ message: 'Invalid token' });
          return;
        } 
      }
    }
    console.log('authenticated');
    next();
  }
  

app.get('/', (req, res) => {
    res.json({"Hello": "World",
            "Version": 2})
})

app.get('/api/health', (req, res) => {
    res.json({"healthy": true})
})

app.post('/api/user', (req, res) => {
    const {firstName, lastName, email, password, profilePicture} = JSON.parse(req.body);
      const saltRounds = 10;
      var encryptedPassword;
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          //console.error(err);
          res.json("Status 500");
          console.log("Status 500");
        } else {
          encryptedPassword = hash;
          const newUser = new User({
            firstName,
            lastName,
            email,
            password: encryptedPassword,
            profilePicture
          });
          newUser.save((error) => {
            if (error) {
                if (error instanceof mongoose.Error.ValidationError) {
                    res.json("Status 400");
                    console.log("Status 400");
                  }
                  else {
                    res.json("Status 500");
                    console.log("Status 500");
                  }
              
            } else {
              res.json("Status 200 (Success)");
              console.log("Status 200 (Success)");
            }
          });
        }
      });
 
    
});

app.post('/api/animal', authenticate, (req, res) => {
    const {name, hoursTrained, dateOfBirth, profilePicture} = JSON.parse(req.body);
    const owner = req.user._id;
    const newAnimal = new Animal({
        name,
        hoursTrained,
        owner,
        dateOfBirth,
        profilePicture
      });
      
      newAnimal.save((error) => {
        if (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                res.json("Status 400");
                console.log("Status 400");
              }
              else {
                res.json("Status 500");
                console.log("Status 500");
              }
          console.log(error);
        } else {
          res.json("Status 200 (Success)");
          console.log("Status 200 (Success)");
        }
      });
    
});

app.post('/api/training', authenticate, (req, res) => {
    const {date, description, hours, animal, user, trainingLogVideo} = JSON.parse(req.body);
    const newTrainingLog = new TrainingLog({
        date,
        description,
        hours,
        animal,
        user,
        trainingLogVideo
      });
      var animalCheck;
      async function checkAnimal() {
        animalCheck = await Animal.findOne({ _id: animal });
      }
      checkAnimal();
        
        setTimeout(function() {
            if (animalCheck == null) {
                res.json("Status 400");
                console.log("Status 400: No animal found");
            }
            else if (animalCheck.owner != user) {
                res.json("Status 400");
                console.log("Status 400: Does not match");
              }
              else {
                newTrainingLog.save((error) => {
                    if (error) {
                        if (error instanceof mongoose.Error.ValidationError) {
                            res.json("Status 400");
                            console.log("Status 400: Validation Error");
                          }
                          else {
                            res.json("Status 500");
                            console.log("Status 500");
                            async function help() {
                               console.log(await Animal.findOne({ _id: animal }))
                            }
                            help();
                          }
                      console.log(error);
                    } else {
                      res.json("Status 200 (Success)");
                      console.log("Status 200 (Success)");
                    }
                  });
              }
        }, 3000);
     


    
});

app.get('/api/admin/users', authenticate, async (req, res) => {
        

    const count = await User.countDocuments();
    const limit = 10;
    const totalPages = Math.ceil(count / limit);
    try {
        const users = await User.find().skip((totalPages - 1) * limit).limit(limit);
        console.log(users);
        res.send(users);
    }
    catch (error) {
        console.log("Status 400");
        res.json("Status 400");
    }
 });

 app.get('/api/admin/animals', authenticate, async (req, res) => {
        

    const count = await Animal.countDocuments();
    const limit = 10;
    const totalPages = Math.ceil(count / limit);
    try {
        const animals = await Animal.find().skip((totalPages - 1) * limit).limit(limit);
        console.log(animals);
        res.send(animals);
    }
    catch (error) {
        console.log("Status 400");
        res.json("Status 400");
    }
 });

 app.get('/api/admin/training', authenticate, async (req, res) => {
        

    const count = await TrainingLog.countDocuments();
    const limit = 10;
    const totalPages = Math.ceil(count / limit);
    try {
        const trainingLogs = await TrainingLog.find().skip((totalPages - 1) * limit).limit(limit);
        console.log(trainingLogs);
        res.send(trainingLogs);
    }
    catch (error) {
        console.log("Status 400");
        res.json("Status 400");
    }
 });

 app.post('/api/user/login', async (req, res) => {
    const {username, password} = JSON.parse(req.body);
    const userCheck = await User.findOne({ email: username }).select('password');

    if (userCheck != null) {
        const match = await bcrypt.compare(password, userCheck.password)
        
        if (match == true) {
            res.json("Status 200 (Success)");
            console.log("Status 200 (Success)");
            
            
        }
        else {
            console.log("Status 403: Inc");
            res.json("Status 403");
        }
    }
    else {
        console.log("Status 403");
        res.json("Status 403");
    }

 });

 
    app.post('/api/user/verify', async (req, res) => {
        const {username, password} = JSON.parse(req.body);
        const userCheck = await User.findOne({ email: username });
    
        if (userCheck != null) {
            const match = await bcrypt.compare(password, userCheck.password)
            if (match == true) {
                const exp = Math.floor(Date.now() / 1000) + (60 * 60);
                const payload = {
                    _id: userCheck._id,
                    firstName: userCheck.firstName,
                    lastName: userCheck.lastName,
                    email: userCheck.email,
                    password: userCheck.password,
                    profilePicture: userCheck.profilePicure,
                    exp: exp,
                 };
                const token = jwt.sign({payload}, SECRET_KEY);
                userCheck.jwt = token;
                await userCheck.save();
                res.json({token});
                console.log("Status 200 (Success)");
            }
            else {
                console.log("Status 403: Inc");
                res.json("Status 403");
            }
        }
        else {
            console.log("Status 403");
            res.json("Status 403");
        }
    
     });


     app.post('/api/file/upload', async (req, res) => {
        //file upload code
    
     });


app.listen(APP_PORT, () => {
    console.log(`api listening at http://localhost:${APP_PORT}`)
})

