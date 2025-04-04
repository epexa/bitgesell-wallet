import { existsSync, readFileSync, writeFileSync } from 'fs';
import { rm, cp } from 'fs/promises';
import { join, resolve } from 'path';
import LAYOUT_NAMES from './src/layouts.js';

const removeFile = async (filePath) => {
	try {
		await rm(filePath, { force: true });
		console.log(`[utils] Removed ${filePath}`);
	}
	catch (error) {
		console.error(`[utils] Error removing ${filePath}:`, error);
	}
};

const generateImports = async () => {
	const srcDir = 'src/';
	const outputFile = join(srcDir, 'generated-imports.js');
	const importStatements = [];

	await removeFile(outputFile);

	LAYOUT_NAMES.forEach((dir) => {
		const modulePath = join(srcDir, dir, `${dir}.js`);
		if ( ! existsSync(modulePath)) return;
		importStatements.push(`import './${dir}/${dir}';`);
	});

	const fileContent = `${importStatements.join('\n')}\n`;

	writeFileSync(outputFile, fileContent, 'utf8');

	console.log(`[utils] File ${outputFile} successfully generated with the following imports:\n${fileContent}`);
};

const copyPublicFolder = async (distDirPath = 'dist') => {
	const publicDir = resolve(process.cwd(), 'public');
	const distDir = resolve(process.cwd(), distDirPath);

	try {
		await rm(distDir, { recursive: true, force: true });
		console.log('[utils] Existing dist folder removed');

		await cp(publicDir, distDir, { recursive: true });
		console.log('[utils] Public folder copied to dist');
	}
	catch (error) {
		console.error('[utils] Error copying public folder:', error);
		throw error;
	}
};

const buildLayouts = (outputFile = 'temp_index.html') => {
	const content = LAYOUT_NAMES.map((name) => readFileSync(`src/${name}/${name}.html`, 'utf-8')).join('');

	writeFileSync(outputFile, content);
	console.log(`[utils] Rebuilt ${outputFile} from: ${LAYOUT_NAMES.join(', ')}`);
};

export {
	generateImports,
	removeFile,
	copyPublicFolder,
	buildLayouts,
};
