import { existsSync, readFileSync, writeFileSync } from 'fs';
import { rm, cp, readdir } from 'fs/promises';
import { join, resolve } from 'path';
import LAYOUT_NAMES from './src/layouts.js';

const removeFileOrDir = async (filePath, options = { force: true, recursive: false }) => {
	try {
		await rm(filePath, options);
		console.log(`[utils] Removed ${filePath}`);
	}
	catch (error) {
		console.error(`[utils] Error removing ${filePath}:`, error);
		throw error;
	}
};

const generateImports = async () => {
	const srcDir = 'src/';
	const outputFile = join(srcDir, 'generated-imports.js');
	const importStatements = [];

	await removeFileOrDir(outputFile);

	LAYOUT_NAMES.forEach((dir) => {
		const modulePath = join(srcDir, dir, `${dir}.js`);
		if ( ! existsSync(modulePath)) return;
		importStatements.push(`import './${dir}/${dir}';`);
	});

	const fileContent = `${importStatements.join('\n')}\n`;

	writeFileSync(outputFile, fileContent, 'utf8');

	console.log(`[utils] File ${outputFile} successfully generated with the following imports:\n${fileContent}`);
};

const copyPublicFolder = async (distDirPath = 'dist', allowList = []) => {
	const publicDir = resolve(process.cwd(), 'public');
	const distDir = resolve(process.cwd(), distDirPath);

	if ( ! existsSync(publicDir)) return;

	try {
		if (existsSync(distDir)) {
			if ( ! allowList.length) {
				await removeFileOrDir(distDir, { recursive: true });
				console.log('[utils] Existing dist folder removed');
			}
			else {
				const existingItems = await readdir(distDir);
				const itemsToRemove = existingItems.filter((item) => ! allowList.includes(item));

				await Promise.all(
					itemsToRemove.map((item) => removeFileOrDir(resolve(distDir, item), { recursive: true })),
				);

				console.log('[utils] Removed non-allowList files from dist directory');
			}
		}

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
	removeFileOrDir,
	copyPublicFolder,
	buildLayouts,
};
