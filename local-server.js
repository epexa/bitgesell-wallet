const htmlFiles = {
	'/': [
		'header',
		'main',
		'dashboard',
		'my-addresses',
		'new-address',
		'send',
		'transactions',
		'footer',
		'welcome',
		'restore',
		'create-wallet',
		'set-password',
		'login',
	],
};

// const serverParams = { address: '127.0.0.1', port: 8081 };
const serverParams = { address: '192.168.1.254', port: 80 };

let workDir = '/src/';
if (process.env.NODE_ENV && process.env.NODE_ENV == 'dist') workDir = '/../bitgesell-wallet-js-frontend-core-dist/';

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);

server.listen(serverParams.port, serverParams.address, () => {
	console.log(`Server running at http://${server.address().address}:${server.address().port} from ${workDir}`);
});

app.use(express.static(`${__dirname}/public/`));
app.use(express.static(__dirname + workDir));

const templateJs = (file) => { return `<script defer src="${file}"></script>`; };
const templateCss = (file) => { return `<link rel="stylesheet" href="${file}">`; };

const generatePathFiles = async (filePath = '') => {
	const fullFilePath = workDir + filePath;
	let files;
	try {
		files = fs.readdirSync(path.join(__dirname, fullFilePath));
	}
	catch (err) {
		return console.error(`unable read files ${fullFilePath}:`, err);
	}
	let pathCssFiles = '';
	let pathJsFiles = '';
	for await (const file of files) {
		const fileExt = path.extname(file).substr(1);
		if (fileExt === 'js') pathJsFiles += templateJs(filePath + file);
		else if (fileExt === 'css') pathCssFiles += templateCss(filePath + file);
	}
	return { css: pathCssFiles, js: pathJsFiles };
};

app.get('/', async (req, res) => {
	const pathFiles = {
		css: '',
		js: '',
	};

	let generatedFiles = await generatePathFiles(`${req.path}lib/`);
	pathFiles.css += generatedFiles.css;
	pathFiles.js += generatedFiles.js;

	generatedFiles = await generatePathFiles(req.path);
	pathFiles.css += generatedFiles.css;
	pathFiles.js += generatedFiles.js;

	let outputStr = '';
	outputStr += pathFiles.css;
	htmlFiles['/'].forEach((htmlFile) => {
		outputStr += fs.readFileSync(`${__dirname + workDir + req.path + htmlFile}.html`);
	});
	outputStr += pathFiles.js;
	res.setHeader('Content-Type', 'text/html');
	res.send(outputStr);
});
