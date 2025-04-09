import { spawn } from 'child_process';
import chokidar from 'chokidar';
import { removeFileOrDir, copyPublicFolder, generateImports, buildLayouts } from './utils.js';
import LAYOUT_NAMES from './src/layouts.js';

const main = async () => {
	const filePath = 'src/temp_index.html';

	await removeFileOrDir(filePath);
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
		await removeFileOrDir(filePath);
		await removeFileOrDir('src/generated-imports.js');
		watcher.close();
	});
};

main();
