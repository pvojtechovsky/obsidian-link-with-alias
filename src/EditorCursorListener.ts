import { Editor, EditorPosition, MarkdownFileInfo, MarkdownView, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { ListenerRegistry, Unregister } from "./ListenerRegistry";
import { equalsPosition } from "./PositionUtils";

/**
 * @param cursorPosition if undefined then editor file changed
 * @return true to be called again with next cursor change, false to cancel this registration
 */
export type CursorChangeCallback = (cursorPosition: EditorPosition | undefined) => boolean;

interface EventData {
	leaf?: WorkspaceLeaf | null;
	file?: TFile | null;
}

/**
 * Controller which can listen on move of editor cursor or deactivation of editor
 */
export class EditorCursorListener {
	private listenerRegistry = new ListenerRegistry<EventData>("EditorCursorListener");

	/**
	 *
	 * @param plugin
	 * @param cursorCheckTimeout number of ms when cursor position has to be checked
	 */
	constructor(private plugin: Plugin, cursorCheckTimeout = 1000) {
		this.plugin.registerEvent(
			//Listen on closing or deactivation current editor
			this.plugin.app.workspace.on("active-leaf-change", (leaf) => {
				this.listenerRegistry.process({ leaf });
			}),
		);
		this.plugin.registerEvent(
			//Listen on modification of file
			this.plugin.app.workspace.on("editor-change", (editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
				this.listenerRegistry.process({ file: info.file });
			}),
		);
		this.plugin.registerInterval(window.setInterval(() => this.onTimeInterval(), cursorCheckTimeout));
	}

	private onTimeInterval(): void {
		this.listenerRegistry.process({});
	}

	/**
	 * Calls `onCursorChange` when cursor moves or when editor becomes inactive
	 * @param editor
	 * @param onCursorChange
	 */
	fireOnCursorChange(editor: Editor, onCursorChange: CursorChangeCallback): Unregister {
		const originFile = getFileFromEditor(editor);
		let lastCursorPosition = editor.getCursor();
		return this.listenerRegistry.register(({ leaf, file }) => {
			if (file && originFile.path != file.path) {
				//we do not care about changes on different files
				return true;
			}
			if (leaf != null) {
				//another editor was opened
				onCursorChange(undefined);
				return false;
			}
			const cursorPosition = editor.getCursor();
			if (!file && equalsPosition(cursorPosition, lastCursorPosition)) {
				return true;
			}
			lastCursorPosition = cursorPosition;
			return onCursorChange(cursorPosition);
		});
	}
}

function getFileFromEditor(editor: Editor): TFile {
	return (editor as any).editorComponent.file;
}
