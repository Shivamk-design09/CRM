const express = require('express')
const mongoose = require('mongoose')
const app = express()
const User = require("./routes/UserRouest")
const Admin = require("./routes/adminRoutes")
const AdminAuth = require("./routes/adminAuthRoutes")
const bodyparser = require('body-parser')
const session = require('express-session')
const fs = require('fs')
const ejs = require('ejs')
const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')
const url = 'mongodb://localhost:27017'
const client = new MongoClient(url)
const userAuth = require('./routes/authRoutes')

let db

async function conntectdb() {
  await client.connect()
  db = client.db('CRM')
}

conntectdb()
// MongoDB connections
mongoose.connect('mongodb://localhost:27017/CRM')

app.use(bodyparser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(
  session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
  }),
)
app.use('/auth', userAuth);

app.get('/dashboard', async (req, res) => {
  res.render('layout', {
    body: require('fs').readFileSync('./views/dashboard.ejs', 'utf8'),
  })
})

app.use("/User", User)


app.use("/admin", Admin)


app.use("/adminauth", AdminAuth)


app.get('/manageQuote', async (req, res) => {
  const user = await User.findById(req.session.userId)
  if (!user) {
    return res.send('user did not found')
  }
  const profileBody = ejs.render(
    fs.readFileSync('./views/managequotes.ejs', 'utf-8'),
    { user },
  )

  res.render('layout', {
    body: profileBody,
  })
})

app.get('/quteDetails', async (req, res) => {
  const user = await User.findById(req.session.userId)
  if (!user) {
    return res.send('user did not found')
  }
  const profileBody = ejs.render(
    fs.readFileSync('./views/quoteDetails.ejs', 'utf-8'),
    { user },
  )
  res.render('layout', { body: profileBody })
})

app.get('/ticket', async (req, res) => {
  const user = await User.findById(req.session.userId)

  if (!user) {
    return res.send('user did not found')
  }
  const profileBody = ejs.render(
    fs.readFileSync('./views/ticket.ejs', 'utf-8'),
    { user },
  )

  res.render('layout', { body: profileBody })
})

app.post('/ticket', async (req, res) => {
  const { subject, tasktype, priority, description } = req.body
  try {
    await User.findByIdAndUpdate(
      req.session.userId,
      {
        $set: {
          subject: subject,
          tasktype: tasktype,
          priority: priority,
          description: description,
        },
      },
      { new: true },
    )
    res.send(`
        <script>
          alert(" Ticket raised");
          window.location.href="/ticket";
        </script>
      `)
    res.redirect('/ticket')
  } catch (err) {
    console.log('Error', err)
  }
})




app.listen(5000, () => {
  console.log('server is running on port 5000')
})
