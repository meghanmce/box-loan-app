const BoxSDK = require('box-node-sdk');
const express = require('express');	
const app = express();
const exphbs = require('express-handlebars');
const fs = require('fs');
const bodyParser = require('body-parser');
const sdkConfig = require('./config.json');
const sdk = BoxSDK.getPreconfiguredInstance(sdkConfig);
const formidableMiddleware = require('express-formidable');

app.use(express.static('public')) // Read in static css file

app.use(formidableMiddleware());

// Get the service account client, used to create and manage app user accounts
var client = sdk.getAppAuthClient('enterprise');

// Handlebars
app.engine('hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs'
}))
app.set('view engine', 'hbs')

// Parse POST bodies for form submissions
app.use(bodyParser.urlencoded({
	extended: false
}));

app.get('/', (req,res) => res.render('upload'))

app.get('/success', (req,res) => res.render('success'))

// Create a new folder with their user name and place the file in their folder
// If there's a folder with the same name, add file to that folder

app.post('/', (req,res) => {
	client.search.query(
	req.fields.name,
	{
		type: 'folder',
		content_types: 'name',
		offset: 0,
		limit: 1,
		fields: 'id'
	})
	.then(results => {
		if (results["total_count"] > 0) {
			var folderId = results["entries"][0]["id"];
			var stream = fs.createReadStream(req.files.file.path);
				client.files.uploadFile(folderId, req.files.file.name, stream)
		} else {
			client.folders.create('0', req.fields.name)
			.then(folder => {
				var stream = fs.createReadStream(req.files.file.path);
				client.files.uploadFile(folder.id, req.files.file.name, stream)
			});
		}
	});
	
	res.redirect('/success')
});

app.listen(3000)