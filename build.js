import { execSync } from 'child_process';
import { generateImports, buildLayouts, copyPublicFolder, removeFile } from './utils.js';

const main = async () => {
	const distFolder = process.argv[2] || 'dist';
	const filePath = 'src/temp_index.html';

	await copyPublicFolder(distFolder);
	await generateImports();
	buildLayouts(filePath);

	execSync(`npx parcel build ${filePath} --no-source-maps --no-cache --dist-dir ${distFolder}`, { stdio: 'inherit' });

	await removeFile(filePath);
	await removeFile('src/generated-imports.js');

	console.log(`\n[Parcel] Build complete. Check folder: ${distFolder}\n`);
};

main();
