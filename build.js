import { execSync } from 'child_process';
import { generateImports, buildLayouts, copyPublicFolder, removeFileOrDir } from './utils.js';

const DIST_WHITE_LIST = [ '.git', '.github', 'CNAME', 'CORS.md', 'README.md' ];

const main = async () => {
	const distFolder = process.argv[2] || 'dist';
	const filePath = 'src/index.html';

	await copyPublicFolder(distFolder, DIST_WHITE_LIST);
	await generateImports();
	buildLayouts(filePath);

	execSync(`npx parcel build ${filePath} --no-source-maps --no-cache --dist-dir ${distFolder}`, { stdio: 'inherit' });

	await removeFileOrDir(filePath);
	await removeFileOrDir('src/generated-imports.js');

	console.log(`\n[Parcel] Build complete. Check folder: ${distFolder}\n`);
};

main();
