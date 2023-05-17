import { Editor, EditorPosition, Loc, Pos } from "obsidian";

/**
 *
 * @param loc
 * @param offsetDif
 * @returns creates new EditorPostion by moving `loc` by `offsetDif` characters
 */
export function moveEditorPosition(loc: EditorPosition, offsetDif: number): EditorPosition {
	const loc2: EditorPosition = {
		line: loc.line,
		ch: loc.ch + offsetDif,
	};
	if (loc2.ch < 0) {
		throw new Error("Negative col");
	}
	return loc2;
}

/**
 *
 * @param editor
 * @param offsetDif
 * @returns EditorPosition of the Editor curosor moved by `offsetDif` characters
 */
export function moveCursor(editor: Editor, offsetDif: number): EditorPosition {
	const newPos = moveEditorPosition(editor.getCursor(), offsetDif);
	editor.setCursor(newPos);
	return newPos;
}

/**
 *
 * @param cursor
 * @param pos
 * @param includingStart if true then returns true also when cursor is at the start. If false cursor must be after start
 * @param includingEnd if true then returns true also when cursor is at the end. If false cursor must be before end
 * @returns true if cursor is in pos
 */
export function isEditorPositionInPos(cursor: EditorPosition, pos: Pos, includingStart = false, includingEnd = false): boolean {
	if (includingStart) {
		if (comparePosition(cursor, pos.start) < 0) {
			return false;
		}
	} else {
		if (comparePosition(cursor, pos.start) <= 0) {
			return false;
		}
	}
	if (includingEnd) {
		if (comparePosition(cursor, pos.end) > 0) {
			return false;
		}
	} else {
		if (comparePosition(cursor, pos.end) >= 0) {
			return false;
		}
	}
	return true;
}

/**
 * @param a
 * @returns offset in line from view or editor position
 */
export function getColumn(a: EditorPosition | Loc): number {
	if ("ch" in a) {
		return a.ch;
	}
	return a.col;
}

/**
 * returns number greater then 0 if a > b
 * returns 0 if a == b
 * returns number lower then 0 if a < b
 */
export function comparePosition(a: EditorPosition | Loc, b: EditorPosition | Loc): number {
	const lineDif = a.line - b.line;
	if (lineDif !== 0) {
		return lineDif;
	}
	return getColumn(a) - getColumn(b);
}

/**
 * returns true if two positions are equal
 */
export function equalsPosition(a: EditorPosition | Loc, b: EditorPosition | Loc): boolean {
	if (a.line !== b.line) {
		return false;
	}
	return getColumn(a) == getColumn(b);
}
