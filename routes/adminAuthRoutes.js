const express = require("express")
const router = express.Router()
router.get('/adminlogin', (req, res) => {
  res.render('adminlogin')
})

router.post('/adminlogin', async (req, res) => {
  const { email, password } = req.body
  try {
    const admin = await db.collection('admin').findOne({ email })

    if (!admin) {
      return res.send('Admin not found')
    }

    if (admin.password !== password) {
      return res.send('Passwor is incorrect')
    }

    req.session.adminId = admin._id
    res.redirect('/admin/home')
  } catch (err) {
    console.log('Error', err)
  }
})

module.exports = router