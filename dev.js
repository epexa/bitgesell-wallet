import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { removeFile, copyPublicFolder, generateImports, buildLayouts } from './utils.js';
import LAYOUT_NAMES from './src/layouts.js';

const main = async () => {
	const filePath = 'src/temp_index.html';

	await removeFile(filePath);
	await copyPublicFolder('dist');
	await generateImports();
	buildLayouts(filePath);

	const parcel = spawn('npx', [
		'parcel',
		'serve',
		filePath,
		'--dist-dir',
		'dist',
		'--host',
		process.env.IP,
		'--port',
		process.env.PORT,
	], { stdio: 'inherit' });

	const pathsToWatch = LAYOUT_NAMES.map((name) => `src/${name}/${name}.html`);
	const watcher = chokidar.watch(pathsToWatch, { ignoreInitial: true });

	watcher.on('change', (file) => {
		console.log(`[dev] Detected change in: ${file}`);
		buildLayouts(filePath);
	});

	parcel.on('close', async (code) => {
		console.log(`[dev] Parcel dev server exited with code: ${code}`);
		await removeFile(filePath);
		await removeFile('src/generated-imports.js');
		watcher.close();
	});
};

main();
