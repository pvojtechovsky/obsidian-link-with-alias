import { App, TFile } from "obsidian";

/**
 * @param app
 * @param target link path
 * @param sourcePath the path of source document
 * @returns target file of link target if existing or creates a new file if missing
 */
export async function getOrCreateFileOfLink(app: App, target: string, sourcePath: string): Promise<TFile> {
	const existingFile = app.metadataCache.getFirstLinkpathDest(target, sourcePath);
	if (existingFile) {
		return existingFile;
	}
	//create new file
	const folder = app.fileManager.getNewFileParent(sourcePath);
	return app.fileManager.createNewMarkdownFile(folder, target);
}
