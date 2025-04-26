import { execSync } from 'child_process';
import { generateImports, buildLayouts, copyPublicFolder, removeFileOrDir } from './utils.js';

const DIST_WHITE_LIST = [ '.git', '.github', 'CNAME', 'CORS.md', 'README.md', 'manifest.json', 'background.js', 'icon-192.png', 'jquery-3.7.1.min.js' ];

const isWebExtensionBuild = process.env.npm_lifecycle_event === 'build-webextension';

const main = async () => {
	const distFolder = process.argv[2] || 'dist';
	const filePath = 'src/index.html';

	await copyPublicFolder(distFolder, DIST_WHITE_LIST);
	await generateImports();
	buildLayouts(filePath);

	const parcelFlags = isWebExtensionBuild ? '--no-optimize --no-scope-hoist' : '--no-source-maps';
	const parcelCommand = `npx parcel build ${filePath} --no-cache --dist-dir ${distFolder} ${parcelFlags}`;
	execSync(parcelCommand, { stdio: 'inherit' });

	await removeFileOrDir(filePath);
	await removeFileOrDir('src/generated-imports.js');

	console.log(`\n[Parcel] Build complete. Check folder: ${distFolder}\n`);
};

main();
