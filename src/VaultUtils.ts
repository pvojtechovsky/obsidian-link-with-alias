import { App, TFile } from "obsidian";

/**
 * @param app
 * @param target link path
 * @param sourcePath the path of source document
 * @returns target file of link target if existing or creates a new file if missing
 */
export async function getOrCreateFileOfLink(app: App, target: string, sourcePath: string): Promise<TFile> {
	app.metadataCache.getFirstLinkpathDest(target, sourcePath);
	const existingFile = app.vault.getMarkdownFiles().find((f) => f.basename == target);
	if (existingFile) {
		return existingFile;
	}
	//create new file
	const filePath = app.fileManager.getNewFileParent(sourcePath).path + target + ".md";
	return app.vault.create(filePath, "");
}
