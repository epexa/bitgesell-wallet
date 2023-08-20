const htmlFiles = [
	'header',
	'main',
	'dashboard/dashboard',
	'my-addresses/my-addresses',
	'new-address/new-address',
	'send/send',
	'transactions/transactions',
	'footer',
	'welcome/welcome',
	'restore/restore',
	'create-wallet/create-wallet',
	'export-wallet/export-wallet',
	'set-password/set-password',
	'login/login',
];

let workDir = '/src/';
if (process.env.DIST_FOLDER) workDir = `/${process.env.DIST_FOLDER}/`;

const express = require('express');
const app = express();
const fs = require('fs');

if ( ! process.env.IP || ! process.env.PORT) {
	console.error('Need to specify IP and PORT environments (example: IP=192.168.23.42 PORT=80 node local-server.js) !');
	process.exit();
}

let server;
if (process.env.PORT !== '443') server = require('http').createServer(app);
else server = require('https').createServer({
	pfx: fs.readFileSync(`${__dirname}/localhost.pfx`),
	passphrase: '12345',
}, app);

server.listen(process.env.PORT, process.env.IP, () => {
	const address = server.address().address;
	console.log(`Server running at http${process.env.PORT === '443' ? 's' : ''}://${address === '127.0.0.1' ? 'localhost' : address}:${server.address().port} from ${workDir}`);
});

app.use(express.static(__dirname + workDir));

if (workDir === '/src/') {
	const path = require('path');

	const templateJs = (file) => { return `<script defer src="${file}"></script>`; };
	const templateCss = (file) => { return `<link rel="stylesheet" href="${file}">`; };

	let pathJsFiles = ``;
	let pathCssFiles = ``;

	const generatePathFiles = async (filePath = '') => {
		const fullFilePath = workDir + filePath;
		let files;
		try {
			files = fs.readdirSync(path.join(__dirname, fullFilePath));
		}
		catch (err) {
			return console.error(`unable read files ${fullFilePath}:`, err);
		}
		for await (const file of files) {
			const fileExt = path.extname(file).substr(1);
			if (fileExt === 'js') pathJsFiles += templateJs(file);
			else if (fileExt === 'css') pathCssFiles += templateCss(file);
			else if ( ! fileExt) {
				app.use(express.static(__dirname + fullFilePath + file));
				generatePathFiles(filePath + file);
			}
		}
	};

	(async () => {
		await generatePathFiles('../lib/');
		await generatePathFiles();
	})();

	app.use(express.static(`${__dirname}/public/`));
	app.use(express.static(`${__dirname}/lib/`));

	app.get('/', (req, res) => {
		let outputStr = '';
		outputStr += pathCssFiles;
		htmlFiles.forEach((htmlFile) => {
			outputStr += fs.readFileSync(`${__dirname + workDir + htmlFile}.html`);
		});
		outputStr += pathJsFiles;
		res.setHeader('Content-Type', 'text/html');
		res.send(outputStr);
	});
}
