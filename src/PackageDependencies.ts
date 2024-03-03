import { Plugin, TFile, TFolder } from "obsidian";

interface LinkInfo {
	targetFileName: string;
	sourceFileName: string;
}
type PackageDependenciesDetails = Record<string, Record<string, LinkInfo[]>>;

type PackageDependencies = Record<string, string[]>;

const pdFileName = "packageDependencies.md";
const allPackages = "...all";

function getPackageDependenciesDetails(isIgnored: (path: string) => boolean): PackageDependenciesDetails {
	const packages: PackageDependenciesDetails = {};
	const resolvedLinks = app.metadataCache.resolvedLinks;
	for (const sourceFileName in resolvedLinks) {
		if (isIgnored(sourceFileName)) {
			continue;
		}
		const sourcePackageName = getPackageName(sourceFileName);
		const fileLinks = resolvedLinks[sourceFileName];
		for (const targetFileName in fileLinks) {
			const targetPackageName = getPackageName(targetFileName);
			if (!packages[sourcePackageName]) {
				packages[sourcePackageName] = {};
			}
			if (!packages[sourcePackageName][targetPackageName]) {
				packages[sourcePackageName][targetPackageName] = [];
			}
			packages[sourcePackageName][targetPackageName].push({ targetFileName, sourceFileName });
		}
	}
	return packages;
}

export async function updatePackageDependenciesDetails(): Promise<TFile> {
	const pdFile = await updateFile(pdFileName, printPackagesToString(getPackageDependenciesDetails((path) => path === pdFileName)));

	app.workspace.getLeaf().openFile(pdFile);

	return pdFile;
}

async function updateFile(fileName: string, data: string): Promise<TFile> {
	const file = app.vault.getAbstractFileByPath(fileName);
	if (file instanceof TFolder) {
		throw new Error("Cannot replace folder by file: " + fileName);
	} else if (file instanceof TFile) {
		app.vault.modify(file, data);
		return file;
	} else {
		return app.vault.create(fileName, data);
	}
}

function getPackageName(fileName: string): string {
	const idx = fileName.lastIndexOf("/");
	if (idx >= 0) {
		return fileName.substring(0, idx);
	}
	return "/";
}

function printPackagesToString(packages: PackageDependenciesDetails): string {
	const result: string[] = [];
	const packs = getSortedKeys(packages);
	for (const packageName of packs) {
		const dependencies = packages[packageName];
		const packs = getSortedKeys(dependencies);
		for (const targetPackageName of packs) {
			if (packageName !== targetPackageName) {
				const targets = dependencies[targetPackageName];
				result.push(
					`${packageName} -> ${targetPackageName}: ${targets.length}x [[${targets[0].targetFileName}| ${getFileName(
						targets[0].sourceFileName,
					)}=>${getFileName(targets[0].targetFileName)}]]`,
				);
			}
		}
	}
	return result.join("\n");
}

function getFileName(path: string): string {
	if (path.endsWith(".md")) {
		path = path.substring(0, path.length - 3);
	}
	const idx = path.lastIndexOf("/");
	if (idx >= 0) {
		return path.substring(idx + 1);
	}
	return path;
}

function getSortedKeys(record: Record<string, unknown>): string[] {
	return [...Object.keys(record)].sort();
}

let lastPackageDependencies: PackageDependencies | undefined;

export async function listenOnPackageDependenciesChange(plugin: Plugin): Promise<void> {
	const eventRef = plugin.app.metadataCache.on("changed", (file, data, cache) => {
		if (file.path === pdFileName) {
			lastPackageDependencies = parsePackageDependencies(data);
		}
	});

	if (await app.vault.adapter.exists(pdFileName)) {
		const content = await app.vault.adapter.read(pdFileName);
		lastPackageDependencies = parsePackageDependencies(content);
	}

	plugin.register(() => {
		plugin.app.metadataCache.offref(eventRef);
	});
}

/**
 * @param sourcePackage
 * @returns list of packages which are visible from `sourcePackage`
 */
export function getPackageDependencies(sourcePackage: string): string[] {
	if (!lastPackageDependencies) {
		return [allPackages];
	}
	let dependendsOnPackages = lastPackageDependencies[sourcePackage];
	if (!dependendsOnPackages) {
		lastPackageDependencies[sourcePackage] = dependendsOnPackages = [normalizePackageName(sourcePackage)];
	}
	return dependendsOnPackages;
}

const packageDepLineRE = /([^>]*?)\s*->\s*([^:]*)/;

function parsePackageDependencies(content: string): PackageDependencies {
	const pd: PackageDependencies = {};
	const lines = content.split(/[\n\r]+/);
	for (const line of lines) {
		const match = packageDepLineRE.exec(line);
		if (match) {
			const packageName = match[1];
			const dependensOnPackage = match[2];
			if (!pd[packageName]) {
				//the package can allways see itself
				pd[packageName] = [normalizePackageName(packageName)];
			}
			pd[packageName].push(normalizePackageName(dependensOnPackage));
		}
	}
	return pd;
}

function normalizePackageName(name: string): string {
	if (name === allPackages) {
		return name;
	}
	if (!name.endsWith("/")) {
		name = name + "/";
	}
	return name;
}

/**
 * @param path
 * @returns all folders which this path depends on, so there can be link targets from this path
 */
export function getVisibleFolders(path: string): string[] {
	if (path === pdFileName) {
		return [allPackages];
	}
	const sourcePackage = getPackageName(path);
	return getPackageDependencies(sourcePackage);
}

export function isInVisibleFolder(path: string, visibleFolders: string[]): boolean {
	const targetPackage = normalizePackageName(getPackageName(path));
	const isVisible = visibleFolders.findIndex((p) => p === targetPackage || p === allPackages) >= 0;
	return isVisible;
}
