const path = require('path')
const fs = require('fs')
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const handlebars = require('express-handlebars')


const app = express()


app.engine('handlebars',handlebars.engine({layoutsDir: 'views/layouts', defaultLayout: 'main-layout', extname: 'handlebars'}))


app.set('view engine','handlebars')
app.set('views','views')


const adminRouter = require("./routes/admin")
const errorController = require('./controllers/error-notification')

const mongoConnect = require('./utils/database').mongoConnect

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname,'public')))

/*
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Methods','GET','POST')
    res.setHeader('Access-Control-Allow-Headers','Content-Type','Authorization')
    next()
})
*/






// Thanks to "Express", "http" createServer and listen functions are combined




mongoConnect(() => {


    const server = app.listen(8081,() => {
        console.log(`listening on *:8081`);
    })
    
    const io = require('./socket.js').init(server)

    
    io.on('connection', socket => {
        console.log('Client connected')
    })


    adminRouter.adminGetData(io)

//    app.use(() => adminRouter.adminGetData(io))

//    app.use(errorController.get404)


    
})

// app.listen(process.env.PORT || 3000)

/*
const server = app.listen(3000)
app.listen(process.env.PORT || 3000)

const io = require('socket.io')(server)

io.on('connection', socket => {
    console.log('Client connected')

})
*/