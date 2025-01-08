import { App, Plugin, TFile } from "obsidian";

/**
 * converts single value or array of values into array of values
 * @param v
 * @returns
 */
export function toArray<T>(v: T | T[] | null | undefined): T[] {
	if (v == null) {
		return [];
	}
	if (Array.isArray(v)) {
		return v;
	}
	return [v];
}

export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.substring(1);
}

export async function delay(time: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export function isNewFile(file: TFile): boolean {
	return now() - file.stat.ctime < 50;
}

export function now(): number {
	return new Date().getTime();
}

interface PluginsAware extends App {
	plugins: PluginsHolder;
}

interface PluginsHolder {
	getPlugin(name: string): Plugin;
}

function isPluginsAware(app: App): app is PluginsAware {
	return "plugins" in app;
}

export function getPlugin(application: App, pluginName: string): Plugin | undefined {
	if (isPluginsAware(application)) {
		return application.plugins.getPlugin(pluginName);
	}
}
