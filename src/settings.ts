import { App, PluginSettingTab, Setting, ToggleComponent } from "obsidian";
import { default as FrontmatterLinksPlugin, default as LinkWithAliasPlugin } from "./main";

export interface LinksSettings {
	copyDisplayText: boolean;
}

export const DEFAULT_SETTINGS: LinksSettings = {
	copyDisplayText: true,
};

export class LinksSettingTab extends PluginSettingTab {
	private plugin: LinkWithAliasPlugin;

	constructor(app: App, plugin: FrontmatterLinksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		new Setting(this.containerEl)
			.setName("Copy selected text as link file")
			.setDesc("When selected then creates link `[[text|text]]`, otherwise `[[|text]]`.")
			.addToggle((component: ToggleComponent) => {
				component.setValue(this.plugin.settings.copyDisplayText);
				component.onChange((value: boolean) => {
					this.plugin.settings.copyDisplayText = value;
					this.plugin.saveSettings();
				});
			});
	}

	hide() {
		this.containerEl.empty();
	}
}
