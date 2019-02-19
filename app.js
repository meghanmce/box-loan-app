const BoxSDK = require('box-node-sdk');  // Box SDK
const fs = require('fs');                // File system for config
const app = require('express')();				// Initialize and create Express App
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');  // exposes submitted form values on req.body in your route handlers
const session = require('express-session');
var sdkConfig = require('./config.json'); 
var sdk = BoxSDK.getPreconfiguredInstance(sdkConfig); // Instantiate instance of SDK using generated JSON config

// Get the app admin account, used to create and manage app user accounts
var adminAPIClient = sdk.getAppAuthClient('enterprise')

adminAPIClient.users.get(adminAPIClient.CURRENT_USER_ID)
	.then(currentUser => {
		console.log("current user name ", currentUser.name)
	});

	// Handlebars
app.engine('hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs'
}))
app.set('view engine', 'hbs')

// Set up sessions, so we can log users in and out
app.use(session({
	secret: 'session secret',
	resave: false,
	saveUninitialized: false
}));

// parse POST bodies for form submissions
app.use(bodyParser.urlencoded({
	extended: false
}));

app.get('/signup', (req, res) => res.render('signup'))

app.get('/uploadfiles', (req, res) => res.render('uploadfiles'))

app.post('/signup', function(req, res) {

	var requestParams = {
		body: {
			name: req.body.name,
			is_platform_access_only: true
		}
	};
	// Create a new Box user record for this user with their name
	adminAPIClient.post('/users', requestParams, adminAPIClient.defaultResponseHandler(function(err, data) {

		if (err) {
			res.render('/', {
				error: 'An error occurred during signup - ' + err.message,
				errorDetails: util.inspect(err)
			});
			return;
		}

		// If the user was created correctly, set up their logged-in session
		req.session.name = req.body.name;
		req.session.userID = data.id;
		req.session.userName = data.name;
		res.redirect('/uploadfiles');

		// If the user was created correctly, create a new folder with their user name
		adminAPIClient.folders.create('0', req.session.userName)
		.then(folder => {
			console.log("folder id is: ", folder.id)
		});
	}));
});

app.listen(3000)
