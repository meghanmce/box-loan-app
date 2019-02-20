const BoxSDK = require('box-node-sdk');  // Box SDK
const express = require('express');	
const app = express();
const exphbs = require('express-handlebars');
// const path = require('path');
const fs = require('fs');
const session = require('express-session')
const bodyParser = require('body-parser');  // Exposes submitted form values on req.body in route handlers

var sdkConfig = require('./config.json');
var sdk = BoxSDK.getPreconfiguredInstance(sdkConfig);

app.use(express.static('public')) // read in static css file

// Get the service account client, used to create and manage app user accounts
var client = sdk.getAppAuthClient('enterprise');

// Handlebars
app.engine('hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs'
}))
app.set('view engine', 'hbs')

// parse POST bodies for form submissions
app.use(bodyParser.urlencoded({
	extended: false
}));

// Set up sessions 
app.use(session({
	secret: 'session secret',
	resave: false,
	saveUninitialized: false
}));

app.get('/', (req,res) => res.render('upload'))

app.get('/success', (req,res) => res.render('success'))

//	Create a new folder with their user name and place the file in their folder
app.post('/', (req,res) => {	
	client.folders.create('0', 'New Client')
		.then(folder => {			
			console.log(folder.id)
			var stream = fs.createReadStream('/Users/meghanmceneaney/Desktop/MeghanResume.pdf');
			client.files.uploadFile(folder.id, 'clientapp.pdf', stream) 
		});
	res.redirect('/success')
});

app.listen(3000)