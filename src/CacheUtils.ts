import { CachedMetadata, Plugin, TFile } from "obsidian";
import { ListenerRegistry, Unregister } from "./ListenerRegistry";

type CacheChangedCallback = (cache: CachedMetadata, data: string) => boolean;

interface ChangeCallbackData {
	file: TFile;
	cache: CachedMetadata;
	data: string;
}
export class CachedMetadataProvider {
	private changeRegistry = new ListenerRegistry<ChangeCallbackData>("CachedMetadataProvider");

	constructor(private readonly plugin: Plugin) {
		this.plugin.registerEvent(
			this.plugin.app.metadataCache.on("changed", (file: TFile, data: string, cache: CachedMetadata) => {
				this.changeRegistry.process({ file, cache, data });
			}),
		);
	}

	registerOnMetadataChange(file: TFile, callback: CacheChangedCallback): Unregister {
		return this.changeRegistry.register(({ file: cacheFile, data, cache }) => {
			if (cacheFile.path === file.path) {
				return callback(cache, data);
			}
			return true;
		});
	}
}
