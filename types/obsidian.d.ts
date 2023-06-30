import "obsidian";

declare module "obsidian" {
	interface FileManager {
		createNewMarkdownFile(folder: TFolder, fileName: string): Promise<TFile>;
	}
}
