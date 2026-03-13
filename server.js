const express = require('express')
const mongoose = require('mongoose')
const app = express()
const User = require('./models/usermodel')
const bodyparser = require('body-parser')
const session = require("express-session")


mongoose.connect('mongodb://localhost:27017/CRM')
app.use(bodyparser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static("public"))
app.use(session({
  secret: "secretkey",
  resave: false,
  saveUninitialized: true
}))


app.get("/dashboard",(req,res)=>{
res.render("layout",{body: require("fs").readFileSync("./views/dashboard.ejs","utf8")})
})
app.get('/',(req,res)=>{
  res.render('home')
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email: email })
    // console.log(user)
    if (!user) {
      res.send('user did not found')
    }
    if (user.password != password) {
        res.send('invalid password')
       //req.session.userId = user._id
      } 
      req.session.userId = user._id
     res.redirect('dashboard')

  } catch (err) {
    console.log('Error', err)
  }
})



app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  const { name, email, password, contact, confPassword, gender } = req.body

  try{
    const existUser = await User.findOne({email:email})
    if(existUser){
      res.send(`
        <script>
          alert("User already exists with this email");
          window.location.href="/register";
        </script>
      `)
    }
  }catch(err){
    console.log("Error",err)
  }

  if (password !== confPassword) {
    return res.send('password did not match')
  }
  {
    const newUser = new User({
      name,
      email,
      password,
      contact,
      gender,
    })
    await newUser.save()
  }
  res.redirect("/login")
})

// app.get('/dashboard', (req, res) => {
//   res.render('dashboard')
// })


app.get("/profile",(req,res)=>{
res.render("layout",{body: require("fs").readFileSync("./views/profile.ejs","utf8")})
})

app.get("/password",(req,res)=>{
res.render("layout",{body: require("fs").readFileSync("./views/password.ejs","utf8")})
})

 app.post("/password", async(req,res)=>{
  const {password,newpassword,confpassword} = req.body
  const userId = req.session.userId 
  try{
    const user = await User.findById(userId)
    if(!user){
     return   res.send("user not found")
    }

    if(password !== confpassword){
    return  res.send("passwod did not match")
    }
  
    if(user.password !== password){
     return res.send("Password did not match")
    }
    user.password = newpassword
    await user.save()

    res.send(`
      <script>
          alert("Password change successfully");
          window.location.href="/password";
        </script>
      `)

  }catch(err){
    console.log(err)
  }

})


//Forgot Password
app.get('/forgotPassowrd', async (req, res) => {
  res.render('forgotpass')
})

app.post('/forgot', async (req, res) => {
  const { email } = req.body
  try {
    const existuser = await User.findOne({ email: email })

    if (!existuser) {
      return res.send('User not found')
    }

    res.send(`
<form action="/reset" method="POST">
<input type="hidden" name="email" value="${email}">
<input type="password" name="password" placeholder="Enter New Password">
<button type="submit">Reset Password</button>
</form>
`)
  } catch (err) {
    console.log('Error', err)
  }
})


// now write the reset password route
app.post("/reset", async(req,res)=>{
    const {email,password} = req.body
    try{
        await User.updateOne(
            {email:email},
            {$set:{password:password}}
        )
        res.send("Password Change successfully")
    }catch(err){
        res.send("Error",err)
    }
})

app.get("/changepassword",(req,res)=>{
    res.render("changepassword")
})

app.post("/changePassword", async (req, res) => {

    const { password, newPassword ,confPassword} = req.body

         const userId = req.session.userId 

    try {

        const user = await User.findById(userId)

        if(!user){
            return res.send("User not found")
        }

        if(password === confPassword){
          return res.send("passwod did not match")
        }

        // old password check
        if(user.password !== password){
            return res.send("Old password incorrect")
        }

        // update password
        user.password = newPassword

        await user.save()

        res.send("Password changed successfully")

    } catch(err){
        console.log(err)
        res.send("Error changing password")
    }

})


app.get("/profile",(req,res)=>{
  res.render("profile")
})



app.listen(5000, () => {
  console.log('server is running on port 5000')
})
