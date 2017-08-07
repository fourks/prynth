let express = require('express');
let router = express.Router();
let exec = require('child_process').exec;
let fs = require('fs');
let os = require('os');
let path = require('path');
let private_path = path.join(__dirname, '../private/');

// let configfile = '/Users/if/Desktop/prynthtemp/server/private/config.json';
// let configbuffer = require(configfile);

router.get('/', function(req, res, next) {
	var configFile = fs.readFileSync(private_path +'config.json');
	var configData = JSON.parse(configFile);
	var defaultSCFile = configData.defaultSCFile;
	var defaultssid = configData.wifinetworks[0];
	var hostname = os.hostname();
	// var hostname = configData.hostname;

	res.render('settings', {defaultSCFile: defaultSCFile, defaultssid: defaultssid, hostname: hostname});
});


router.post('/shutdown', function (req, res) {
	// console.log('shutdown received');
	exec('sudo poweroff', function (error, stdout, stderr) {
		console.log(stdout);
	});
})

router.post('/reboot', function (req, res) {
	// console.log('reboot received');
	exec('sudo reboot', function (error, stdout, stderr) {
		console.log(stdout);
	});
})

router.post('/setwifi', function (req, res) {
	var networkname = req.body.networkname;
	var networkpass = req.body.networkpass;

	var buffer = "";

	var configFile = fs.readFileSync(private_path +'config.json');
	var configData = JSON.parse(configFile);

	// console.log(configData);
	// configData.wifinetworks.push([networkname, networkpass]);
	configData.wifinetworks = ([networkname, networkpass]);
	var configJSON = JSON.stringify(configData, null, 2);

	// console.log(configJSON);
	fs.writeFileSync(private_path +'config.json', configJSON);

	var command = 'sudo sed -i "/#prynth begin/,/#prynth end/ s/\\(ssid *= *\\).*/\\1\\"'+networkname+'\\"/ ;/#prynth begin/,/#prynth end/ s/\\(psk *= *\\).*/\\1\\"'+networkpass+'\\"/" /etc/wpa_supplicant/wpa_supplicant.conf';
	console.log(command);

	var child = exec(command, function (error, stdout, stderr) {
		console.log(stdout);
		res.redirect('/settings');
	});

})

router.post('/hostname', function (req, res) {
	var hostname = req.body.hostname;

	var configFile = fs.readFileSync(private_path +'config.json');
	var configData = JSON.parse(configFile);

	configData.hostname= hostname;
	var configJSON = JSON.stringify(configData, null, 2);

	// console.log(configJSON);
	fs.writeFileSync(private_path +'config.json', configJSON);

	exec('sudo sed -i "s/\\(127.0.1.1 *\\).*/\\1\\tnewhostname/" /etc/hosts', function (error, stdout, stderr) {
		exec('sudo sed -i "s/^.*/raspberrypi/" /etc/hostname', function (error, stdout, stderr) {
			res.redirect('/settings');
		});
	});
});

router.post('/setdefaultscfile', function (req, res) {
	var defaultSCFile= req.body.defaultSCFile;
	console.log(defaultSCFile);

	//CHANGE TO RELATIVE PATHS!!!
	var configFile = fs.readFileSync(private_path +'config.json');
	var configData = JSON.parse(configFile);

	configData.defaultSCFile = defaultSCFile;
	var configJSON = JSON.stringify(configData, null, 2);

	fs.writeFileSync(private_path +'config.json', configJSON);
})


module.exports = router;
