const User = require('../models/usermodel')
const express = require('express')
const bcrypt = require("bcrypt")
const router = express.Router();
router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    const { name, email, password, contact, confPassword, gender, alternateEmail, } = req.body

    try {
        const existUser = await User.findOne({ email: email })
        if (existUser) {
            res.send(`
        <script>
          alert("User already exists with this email");
          window.location.href="/register";
        </script>
      `)
        }

        if (password !== confPassword) {
            return res.send('password did not match')
        }

        const hashpassword = await bcrypt.hash(password, 10)

        {
            const newUser = new User({
                name,
                email,
                hashpassword,
                contact,
                gender,
                alternateEmail,
            })
            await newUser.save()
        }
        res.redirect('/login')
    } catch (err) {
        console.log('Error', err)
    }
})


router.get('/login', (req, res) => {
    res.render('login')
})


router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email: email })
        // console.log(user)
        if (!user) {
            return res.send('user did not found')
        }

        const encpassword = await bcrypt.compare(password,user.hashpassword)

        if(!encpassword){
            return res.send("password did not match")
        }
        req.session.userId = user._id
        res.redirect('/dashboard')
    } catch (err) {
        console.log('Error', err)
    }
})


router.get('/forgotPassowrd', async (req, res) => {
  res.render('forgotpass')
})


router.post('/forgot', async (req, res) => {
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

//this is reset password
router.post('/reset', async (req, res) => {
  const { email, password } = req.body
  try {
    await User.updateOne({ email: email }, { $set: { password: password } })
    res.send('Password Change successfully')
  } catch (err) {
    res.send('Error', err)
  }
})


module.exports = router;




