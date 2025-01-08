import { App, Plugin } from "obsidian";
import { delay, getPlugin } from "./Utils";

export function getTemplaterPlugin(application: App): TemplaterWrapper | undefined {
	const plugin = getPlugin(application, "templater-obsidian");
	return plugin ? new TemplaterWrapper(plugin as TemplaterPlugin) : undefined;
}

interface TemplaterPlugin extends Plugin {
	templater: Templater;
}

interface Templater {
	files_with_pending_templates: Set<string>;
}

export class TemplaterWrapper {
	constructor(private templaterPlugin: TemplaterPlugin) {}

	async waitUntilDone(): Promise<void> {
		//templater uses delay 300ms
		await delay(400);
		while (this.templaterPlugin.templater.files_with_pending_templates.size > 0) {
			await delay(50);
		}
	}
}
