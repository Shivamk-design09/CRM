const User = require('../models/usermodel')
const express = require("express")
const router = express.Router()

async function conntectdb() {
  await client.connect()
  db = client.db('CRM')
}



router.get('/home', (req, res) => {
  res.render('home')
})

router.get('/profile', async (req, res) => {
  const user = await User.findById(req.session.userId)

  // console.log(user)
  if (!user) {
    return res.send('User not found or not logged in')
  }

  const profileBody = ejs.render(
    fs.readFileSync('./views/profile.ejs', 'utf-8'),
    { user },
  )

  res.render('layout', {
    body: profileBody,
  })
})


router.post('/profile', async (req, res) => {
  const { name, email, contact, alternateEmail, address } = req.body
  try {
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      {
        $set: {
          name: name,
          email: email,
          contact: contact,
          alternateEmail: alternateEmail,
          address: address,
        },
      },
      { new: true },
    )

    res.redirect('/profile')
    res.send(`
        <script>
          alert("User profile updated");
          window.location.href="/register";
        </script>
      `)
  } catch (err) {
    console.log('Error', err)
  }
})


router.get('/password', (req, res) => {
  res.render('layout', {
    body: require('fs').readFileSync('./views/password.ejs', 'utf8'),
  })
})

router.post('/password', async (req, res) => {
  const { password, newpassword, confpassword } = req.body
  const userId = req.session.userId
  try {
    const user = await User.findById(userId)
    if (!user) {
      return res.send('user not found')
    }

    if (newpassword !== confpassword) {
      return res.send('passwod did not match')
    }

    if (user.password !== password) {
      return res.send('Password did not match')
    }
    user.password = newpassword
    await user.save()

    res.send(`
      <script>
          alert("Password change successfully");
          window.location.href="/password";
        </script>
      `)
  } catch (err) {
    console.log(err)
  }
})


router.get('/reqQuote', async (req, res) => {
  const user = await User.findById(req.session.userId)

  if (!user) {
    return res.send('user did not found')
  }

  const profileBody = ejs.render(
    fs.readFileSync('./views/reqQuote.ejs', 'utf-8'),
    { user },
  )

  res.render('layout', {
    body: profileBody,
  })
})

router.post('/reqQuote', async (req, res) => {
  const { company, webDevlopment, query } = req.body
  try {
    await User.findByIdAndUpdate(
      req.session.userId,
      {
        $set: { company: company, webDevlopment: webDevlopment, query: query },
      },
      { new: true },
    )
    res.redirect('/manageQuote')
  } catch (err) {
    console.log('Error', err)
  }
})


router.get('/reqQuote', async (req, res) => {
  const user = await User.findById(req.session.userId)

  if (!user) {
    return res.send('user did not found')
  }

  const profileBody = ejs.render(
    fs.readFileSync('./views/reqQuote.ejs', 'utf-8'),
    { user },
  )

  res.render('layout', {
    body: profileBody,
  })
})

router.post('/reqQuote', async (req, res) => {
  const { company, webDevlopment, query } = req.body
  try {
    await User.findByIdAndUpdate(
      req.session.userId,
      {
        $set: { company: company, webDevlopment: webDevlopment, query: query },
      },
      { new: true },
    )
    res.redirect('/manageQuote')
  } catch (err) {
    console.log('Error', err)
  }
})
router.get('/manageQuote/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  try {
    const body = ejs.render(
      fs.readFileSync('./views/usermanageQuotes.ejs', 'utf-8'),
      { user },
    )

    res.render('layout', { body })
  } catch (err) { }
})




module.exports = router;

