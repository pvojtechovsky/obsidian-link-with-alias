import { Editor, EditorPosition, Plugin, WorkspaceLeaf } from "obsidian";
import { ListenerRegistry, Unregister } from "./ListenerRegistry";
import { equalsPosition } from "./PositionUtils";

/**
 * @return true to be called again with next cursor change, false to cancel this registration
 */
export type CursorChangeCallback = (cursorPosition: EditorPosition | undefined) => boolean;

interface EventData {
	leaf?: WorkspaceLeaf | null;
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
		let lastCursorPosition = editor.getCursor();
		return this.listenerRegistry.register(({ leaf }) => {
			const cursorPosition = editor.getCursor();
			if (equalsPosition(cursorPosition, lastCursorPosition) || onCursorChange(cursorPosition)) {
				lastCursorPosition = cursorPosition;
			}
			return true;
		});
	}
}
