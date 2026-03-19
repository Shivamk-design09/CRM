const User = require('../models/usermodel')
const express = require("express")
const router = express.Router()
const fs = require('fs')
const ejs = require('ejs')
const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)
const userAuth=require('./routes/authRoutes')

async function conntectdb() {
  await client.connect()
  db = client.db('CRM')
}

let db


router.get('/changepassword', (req, res) => {
  res.render('changepassword')
})

router.post('/changePassword', async (req, res) => {
  const { password, newPassword, confPassword } = req.body

  const userId = req.session.userId

  try {
    const user = await User.findById(userId)

    if (!user) {
      return res.send('User not found')
    }

    if (newPassword === confPassword) {
      return res.send('password did not match')
    }

    // old password check
    if (user.password !== password) {
      return res.send('Old password incorrect')
    }

    // update password
    user.password = newPassword

    await user.save()

    res.send('Password changed successfully')
  } catch (err) {
    console.log(err)
    res.send('Error changing password')
  }
})


router.get('/Home', (req, res) => {
  res.render('adminlayout', {
    body: require('fs').readFileSync('./views/dashboard.ejs', 'utf8'),
  })
})

router.get('/changePassword', (req, res) => {
  res.render('adminlayout', {
    body: require('fs').readFileSync('./views/adminChangePassword.ejs', 'utf8'),
  })
})

router.post('/changePassword', async (req, res) => {
  const { password, newpassword, confpassword } = req.body

  try {
    const admin = await db.collection('admin').findOne({
      _id: new ObjectId(req.session.adminId),
    })

    if (!admin) {
      return res.send('admin not found')
    }

    if (admin.password !== password) {
      return res.send('Current password did not match')
    }

    if (newpassword !== confpassword) {
      return res.send('password did not match')
    }

    await db
      .collection('admin')
      .updateOne(
        { _id: new ObjectId(req.session.adminId) },
        { $set: { password: newpassword } },
      )

    res.send(`
      <script>
        alert("Password Change Successfully");
        window.location.href="/admin/changePassword";
      </script>
    `)
  } catch (err) {
    console.log('Error', err)
  }
})

router.get('/Users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray()

    const body = ejs.render(
      fs.readFileSync('./views/adminUsers.ejs', 'utf-8'),
      { users },
    )

    res.render('adminlayout', { body })
  } catch (err) {
    console.log('Error', err)
  }
})

router.get('/user/edit/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.send('user did not found')
    }
    const profilebody = ejs.render(
      fs.readFileSync('./views/adminUserEdit.ejs', 'utf-8'),
      { user },
    )
    res.render('adminlayout', { body: profilebody })
  } catch (err) {
    console.log('Error', err)
  }
})


router.post('/user/edit/:userId', async (req, res) => {
  const { name, email, alternateEmail, contact, address } = req.body
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, {
      $set: {
        name: name,
        email: email,
        alternateEmail: alternateEmail,
        contact: contact,
        address: address,
      },
    })

    res.send(`
  <script>
    alert("User Profile Updated");
    window.location.href="/admin/user/edit/${req.params.userId}";
  </script>
`)
  } catch (err) {
    console.log('Error', err)
  }
})

router.post('/delete/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId)
    res.redirect(`/admin/Users`)
  } catch (err) {
    console.log('Error', err)
  }
})


app.get('/adminDashboard', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray()

    const body = ejs.render(
      fs.readFileSync('./views/adminDashboard.ejs', 'utf-8'),
      { users },
    )

    res.render('adminlayout', { body })
  } catch (err) {
    console.log('Error', err)
  }
})

router.get('/manageQuotes', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray()

    const body = ejs.render(
      fs.readFileSync('./views/adminMangeQuotes.ejs', 'utf-8'),
      { users },
    )

    res.render('adminlayout', { body })
  } catch (err) {
    console.log('Error', err)
  }
})

router.get('/manageQuotes/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.send('User did not found')
    }

    const body = ejs.render(
      fs.readFileSync('./views/adminManageQuotesUser.ejs', 'utf-8'),
      { user },
    )

    res.render('adminlayout', { body })
  } catch (err) {
    console.log('Error', err)
  }
})

router.post('/manageQuotes/:userId', async (req, res) => {
  const { remarks } = req.body
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $set: { remarks: remarks }},{new:true}
    )
    res.redirect(`/admin/manageQuotes/${req.params.userId}`)
  } catch (err) {
    console.log('Error', err)
  }
})

module.exports = router;
