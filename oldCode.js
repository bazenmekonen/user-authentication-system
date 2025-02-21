async function signUp(){
    try{
        //awaiting a connection to be established
        await client.connect();
        //Sending the ping to confirm a successful connection
        const db = client.db("gettingStarted")
        const col = db.collection("users")
        
        //Getting user creation information
        const username = rd.question('Make your username');
        const password = rd.question('Make your password');
        const name = rd.question("What is your first and last name?");
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const User = mongoose.model('User', userSchema);

        const user = new User({
            "name": name,
            "username": username,
            "password": hashedPassword,
        })
        
        if(user){
            console.log(`${name} has been added in.`)
            const p = await col.insertOne(user);
        }else{
            console.log('error')
        }

    }catch(error){
        console.log(error);
    }finally{
        await client.close();
    }
}

async function login(username, password, name){
    try{
        await client.connect();
        const db = client.db("gettingStarted");
        const col = db.collection("users");

        const username = rd.question("Enter in username");
        const usernameObj = {"username": username};
        const userFound = await col.findOne(usernameObj);
        if(userFound){
            const password = rd.question("Enter in password");
            const match = await bcrypt.compare(password, userFound.password);
            if(match){
                console.log(`Welcome back: ${userFound.name}`);
                successfulLogin(userFound.name);
            }else{
                console.log("Password isn't found")
            }
        }else{
            console.log('User isn\'t found');
        }

    }catch(error){
        console.log(error)
    }finally {
        client.close();
    }
}

function successfulLogin(name){
    if(name == 'Test User'){
        console.log('You now have access to the private databases');
    }
}

function choice(){
    const choice = rd.question('Do you want to 1.signup or 2.login');
    if(choice == 1){
        signUp();
    }else if(choice == 2){
        login();
    }else{
        console.log("Put in a proper number");
    }
}
