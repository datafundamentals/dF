import * as path from 'path';
import * as fs from 'fs';
import {runTests} from '@vscode/test-electron';

function resolveVSCodeExecutablePath(): string | undefined {
	const fromEnv = process.env.VSCODE_EXECUTABLE_PATH;
	if (fromEnv && fs.existsSync(fromEnv)) {
		return fromEnv;
	}

	const candidates: string[] = [];
	if (process.platform === 'darwin') {
		candidates.push('/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code');
		candidates.push('/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code');
		candidates.push('/Applications/Visual Studio Code.app/Contents/MacOS/Electron');
		candidates.push('/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron');
	} else if (process.platform === 'win32') {
		const programFiles = process.env['PROGRAMFILES'];
		const programFilesX86 = process.env['PROGRAMFILES(X86)'];
		const localAppData = process.env['LOCALAPPDATA'];

		if (programFiles) {
			candidates.push(path.join(programFiles, 'Microsoft VS Code', 'Code.exe'));
		}
		if (programFilesX86) {
			candidates.push(path.join(programFilesX86, 'Microsoft VS Code', 'Code.exe'));
		}
		if (localAppData) {
			candidates.push(path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'));
		}
	} else {
		candidates.push('/usr/share/code/code');
		candidates.push('/usr/bin/code');
		candidates.push('/var/lib/snapd/snap/bin/code');
	}

	return candidates.find(candidate => fs.existsSync(candidate));
}

async function main() {
	try {
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');
		const extensionTestsPath = path.resolve(__dirname, './suite');
		const vscodeExecutablePath = resolveVSCodeExecutablePath();

		if (vscodeExecutablePath) {
			console.log(`Using local VS Code from ${vscodeExecutablePath}`);
		} else {
			console.log('No local VS Code install found; a copy will be downloaded.');
		}

		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			vscodeExecutablePath,
		});
	} catch (err) {
		console.error('Failed to run tests');
		if (err instanceof Error) {
			console.error(err.message, err.stack);
		}
		process.exit(1);
	}
}

main();
