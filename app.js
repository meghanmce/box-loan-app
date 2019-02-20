const BoxSDK = require('box-node-sdk');  // Box SDK
const express = require('express');	
const app = express();
const exphbs = require('express-handlebars');
const fs = require('fs');
const bodyParser = require('body-parser');  // Exposes submitted form values on req.body in route handlers

var sdkConfig = require('./config.json');
var sdk = BoxSDK.getPreconfiguredInstance(sdkConfig);
const formidableMiddleware = require('express-formidable');

app.use(express.static('public')) // read in static css file

app.use(formidableMiddleware());

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

app.get('/', (req,res) => res.render('upload'))

app.get('/success', (req,res) => res.render('success'))

//	Create a new folder with their user name and place the file in their folder
app.post('/', (req,res) => {	
	client.folders.create('0', req.fields['name'])
		.then(folder => {			
			console.log(folder.id)
			var stream = fs.createReadStream(req.files.file.path);
			client.files.uploadFile(folder.id, req.files.file.name , stream) 
		});
	res.redirect('/success')
});

app.listen(3000)