const express = require('express')
const app = new express()
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const mongoose = require('mongoose');
const express_session = require('express-session');
const MongoStorMonge = require('connect-mongo');
var MongoClient = require('mongodb').MongoClient;
// const LocalStrategy = require('passport-local').Strategy;
// const flash = require('connect-flash');
// var MongoDBStore = require('connect-mongodb-session')(Session);

const newUserController = require('./controllers/newUser')
const storeUserController = require('./controllers/storeUser')
const loginController =require('./controllers/login')
const loginUserController =require('./controllers/loginUser')
const logoutController = require('./controllers/logout')
const authMiddleware = require('./middleware/authMiddleware');

var db = require('mongoskin').db("mongodb://localhost/eventsList", { w: 0});
    db.bind('event');

mongoose.connect('mongodb+srv://yoso:yoso@cluster0.1knun.mongodb.net/test',{
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true});

const ejs = require('ejs');
const redirectAuthenticatedMiddleware = require('./middleware/redirectAuthenticatedMiddleware');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

	const uri = "mongodb+srv://yoso:yoso@cluster0.1knun.mongodb.net/test";
	const client = new MongoClient(uri, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	});
	try {
		// Connect to the MongoDB cluster
		await client.connect();
		// Make the appropriate DB calls
		await init(client);

	} catch (e) {
		console.error(e);
	}
}
main().catch(console.err);


async function init(client) {
	// app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true })); //extended:true to encode objects and arrays  https://github.com/expressjs/body-parser#bodyparserurlencodedoptions

	const db = client.db('eventsList')
	const events = db.collection('events')

	app.get('/init', function (req, res) {
		events.insertOne({
			text: "Some Helpful event",
			start_date: new Date(2018, 8, 1),
			end_date: new Date(2018, 8, 5)
		})
		events.insertOne({
			text: "Another Cool Event",
			start_date: new Date(2018, 8, 11),
			end_date: new Date(2018, 8, 11)
		})
		events.insertOne({
			text: "Super Activity",
			start_date: new Date(2018, 8, 9),
			end_date: new Date(2018, 8, 10)
		})
		res.send("Test events were added to the database")
	});

	app.get('/data', function (req, res) {
		events.find().toArray(function (err, data) {
			//set the id property for all client records to the database records, which are stored in ._id field
			for (var i = 0; i < data.length; i++){
				data[i].id = data[i]._id;
				delete data[i]["!nativeeditor_status"];
			}
			//output response
			res.send(data);
		});
	});


	// Routes HTTP POST requests to the specified path with the specified callback functions. For more information, see the routing guide.
	// http://expressjs.com/en/guide/routing.html

	app.post('/data', function (req, res) {
		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid;

		function update_response(err) {
			if (err)
				mode = "error";
			else if (mode == "inserted"){
				tid = data._id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, sid: sid, tid: String(tid) });
		}

		if (mode == "updated") {
			events.updateOne({"_id": ObjectId(tid)}, {$set: data}, update_response);
		} else if (mode == "inserted") {
			events.insertOne(data, update_response);
		} else if (mode == "deleted") {
			events.deleteOne({"_id": ObjectId(tid)}, update_response)
		} else
			res.send("Not supported operation");
	});
};

app.set('view engine','ejs')
app.use(express.static('public'))

app.use(express_session({
    secret: '@#@#@#mine@#@#@',
    resave : false,
    saveUninitialized : true,
    // store: MongoStore.create({mongoUrl:'mongodb://localhost/user_database'}),
    cookie: {
        secure : false,
        maxAge : 1000 * 60 * 60
    }
}));
//app.get('/register',(req,res)=>{
    //res.sendFile(path.resolve(__dirname, 'views/index.html'))
   // res.render('register');
//})
const passport = require('passport');
const path = require('path');

let port = process.env.PORT;
if (port == null||port==""){
    port = 8080;
}
app.listen(port, ()=>{
    console.log('App listening on port 4000')
})

app.get('/',(req,res)=>{
    //res.sendFile(path.resolve(__dirname, 'views/index.html'))
    res.render('index');
})

app.get('/calandar',(req,res)=>{
    res.render('calandar');
})

app.get('/auth/register', redirectAuthenticatedMiddleware ,newUserController)

app.get('/auth/login',redirectAuthenticatedMiddleware,loginController)

app.get('/auth/logout',logoutController)

app.post('/users/register',redirectAuthenticatedMiddleware,storeUserController)

app.post('/users/login',redirectAuthenticatedMiddleware,loginUserController)

