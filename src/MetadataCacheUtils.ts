import { Plugin, TFile } from "obsidian";
import { overrideMethod } from "./ClassUtils";
import { getVisibleFolders, isInVisibleFolder } from "./PackageDependencies";

export interface LinkSuggestion {
	file: TFile;
	path: string;
	alias?: string;
}

/**
 * hooks on app.metadataCache.getLinkSuggestions and filters out all the link suggestions which are not visible from activeFile
 * @param plugin
 */
export function hookOnGetLinkSuggestions(plugin: Plugin): void {
	overrideMethod<LinkSuggestion[]>(plugin, plugin.app.metadataCache, "getLinkSuggestions", (superFnc) => {
		const linkSuggesttion = superFnc();
		const activeFilePath = plugin.app.workspace.getActiveFile()?.path;
		if (activeFilePath) {
			//we actualy edit file `activeFile`
			const visibleFolders = getVisibleFolders(activeFilePath);
			return linkSuggesttion.filter((ls) => isInVisibleFolder(ls.path, visibleFolders));
		}
		return linkSuggesttion;
	});
}

export function hookOnGetLinkpathDest(plugin: Plugin): void {
	overrideMethod<TFile[]>(plugin, plugin.app.metadataCache, "getLinkpathDest", (superFnc, link: string, sourceFilePath: string) => {
		const allDests = superFnc(link, sourceFilePath);
		const visibleFolders = getVisibleFolders(sourceFilePath);
		const filteredVisibleFolders = allDests.filter((f) => isInVisibleFolder(f.path, visibleFolders));
		return filteredVisibleFolders;
	});
}

export function hookOnGetFirstLinkpathDest(plugin: Plugin): void {
	if ("getLinkpathDest" in plugin.app.metadataCache) {
		overrideMethod<TFile | null>(plugin, plugin.app.metadataCache, "getFirstLinkpathDest", (superFnc, link: string, sourceFilePath: string) => {
			const allDests: TFile[] = (plugin.app.metadataCache as any).getLinkpathDest(link, sourceFilePath);
			if (allDests.length == 0) {
				return null;
			}
			if (allDests.length == 1) {
				return allDests[0];
			}
			//search for the most fitting destination
			const sourceParts = sourceFilePath.split("/");
			let bestDest = allDests[0];
			let bestNrSameParts = countSameParts(sourceParts, bestDest.path);
			for (let i = 1; i < allDests.length; i++) {
				const nrSameParts = countSameParts(sourceParts, allDests[i].path);
				if (nrSameParts > bestNrSameParts) {
					bestNrSameParts = nrSameParts;
					bestDest = allDests[i];
				}
			}
			return bestDest;
		});
	}
}

function countSameParts(parts: string[], path: string): number {
	const parts2 = path.split("/");
	let count = 0;
	const maxCount = Math.min(parts.length, parts2.length);
	for (let i = 0; i < maxCount; i++) {
		if (parts[i] !== parts2[i]) {
			break;
		}
		count++;
	}
	return count;
}
