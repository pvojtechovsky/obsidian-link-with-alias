import { FileManager, Notice, TFile } from "obsidian";
import { toArray } from "./Utils";

const aliasPropertyNames = ["aliases", "alias"];

/**
 * Adds `requiredAliases` if they don't exist yet in the `file`
 * @param fileManager
 * @param file
 * @param requiredAliases
 */
export async function addMissingAliasesIntoFile(fileManager: FileManager, file: TFile, requiredAliases: string[]): Promise<void> {
	await fileManager.processFrontMatter(file, (frontmatter) => {
		if (typeof frontmatter == "object") {
			const aliasPropName = aliasPropertyNames.find((name) => frontmatter[name] != null) || aliasPropertyNames[0];
			const existingAliases = toArray<string>(frontmatter[aliasPropName]);
			const toBeAdded: string[] = [];
			requiredAliases.forEach((requiredAlias) => {
				const lowercaseRequiredAlias = requiredAlias.toLocaleLowerCase();
				if (!existingAliases.some((alias) => alias.toLocaleLowerCase() == lowercaseRequiredAlias)) {
					toBeAdded.push(requiredAlias);
				}
			});
			if (toBeAdded.length == 0) {
				new Notice(`Alias ${requiredAliases.join(", ")} already exists`, 5 * 1000);
				return;
			}
			const newAliases = [...existingAliases, ...toBeAdded];
			//longest firs. It is needed for correct detection of back references
			newAliases.sort((a, b) => b.length - a.length);
			frontmatter[aliasPropName] = newAliases;
			new Notice(`Alias ${requiredAliases.join(", ")} ${requiredAliases.length == 1 ? "was" : "were"} added`, 5 * 1000);
		}
	});
}
