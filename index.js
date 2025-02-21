const rd = require('readline-sync')
const {MongoClient, ServerApiVersion} = require('mongodb');
require('dotenv').config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {auth} = require('express-oauth2-jwt-bearer')
const express= require('express');
const app = express();
app.use(express.json());

const port = process.env.PORT;

//We are making a MongCLient with the options being set to the stable API version
/**
 * Mongo Client is a class from the MongoDB Node.js driver, that connects
 * to the MongoDB database
 */
const client = new MongoClient(process.env.DB_URI, {
    //ServerAPI is a options object
    serverApi:{
        //Using the latest version of stable API v1
        version: ServerApiVersion.v1,
        //Only allowing official features
        strict: true,
        //Gives errors if we have depreciation. I think that
        //strict and deprectiationErrors go together.
        deprecationErrors: true,
    }
});
//Initializing connection
//client.connect();

app.post('/registration', async (req, res)=>{
    try{
        //Sending the ping to confirm a successful connection
        const db = client.db("gettingStarted")
        const col = db.collection("users")
        
        //Getting user creation information
        const role = req.body['role']
        const username= req.body['username'];
        const password= req.body['password'];
        const name = req.body['name'];
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = {
            "role": role,
            "name": name,
            "username": username,
            "password": hashedPassword,
        }
        const token = jwt.sign({user}, process.env.PRIVATE_KEY);
        if(col.countDocuments({"username": username})){
            res.send(`${user.username} is taken`)
        }else{
            console.log(`${name} has been added in`)
            const p = await col.insertOne(user);
            res.send(token);
        }
        /*
        if(user){
            console.log(`${name} has been added in.`)
            const p = await col.insertOne(user);
            //res.send(`${name} is in`)
        }else if(userPrototype){
            console.log(`${userPrototype.name} has been added but they are not a authorized user`)
        }else{
            console.log('error')
        }
        */
        
        
    }catch(error){
        console.log(error);
    }
})

app.get("/login", async (req,res)=>{
    try{
        const db = client.db("gettingStarted");
        const col = db.collection("users");

        const username = req.body['username'];
        const password = req.body['password'];
        const name = req.body['name'];

        const usernameObj = {"username": username};
        try{
            const userFound = await col.findOne(usernameObj);
            if(userFound){
                const match = await bcrypt.compare(password, userFound.password);
                if(match){
                    res.send(`Welcome back: ${userFound.name}`);
                    if(userFound.role == 'admin'){
                        console.log('Verified user has accessed')
                    }else{
                        console.log('Hello User');
                    }
                }else{
                    res.send("Password isn't found")
                }
            }else{
                res.send(`That user isn't here`)
            }
        }catch(error){
            console.log(error);
        }    
    }catch(error){
        console.log(error);
    }
});

app.listen(port, ()=> console.log('Listening on 8000'));