import { Editor, EditorPosition, Pos, ReferenceCache } from "obsidian";
import { locToEditorPositon, moveLoc } from "./PositionUtils";

const linkPrefix = "[[";
const linkSuffix = "]]";
const displaTextSeparator = "|";

/**
 * @param editor
 * @param pos
 * @returns ReferenceCache like structure which describes the link in `editor` on `pos` position or undefined if there is no link at `pos` position
 */
export function getReferenceCacheFromEditor(editor: Editor, pos?: EditorPosition): ReferenceCache | undefined {
	if (!pos) pos = editor.getCursor();
	const line = editor.getLine(pos.line);

	let posOffset = pos.ch;
	if (line.substring(posOffset, posOffset + 2) == linkPrefix) {
		//cursor is at the beginning of link
		posOffset += 2;
	}
	//search for closing ]]
	if (line.charAt(posOffset) == "]") {
		posOffset--;
	}
	let lastLookup: string | undefined;
	let endIdx = firstIndexOf(line, posOffset, (lookup) => {
		lastLookup = lookup(2);
		return lastLookup == linkSuffix || lastLookup == linkPrefix;
	});
	if (endIdx < 0 || lastLookup != linkSuffix) {
		return;
	}
	endIdx += linkSuffix.length;
	//search for openning [[
	let lastLookup2: string | undefined;
	const startIdx = lastIndexOf(line, posOffset, (lookup) => {
		lastLookup2 = lookup(2);
		return lastLookup2 == linkSuffix || lastLookup2 == linkPrefix;
	});
	if (startIdx < 0 || lastLookup2 != linkPrefix) {
		return;
	}
	const original = line.substring(startIdx, endIdx);
	const parts = original.substring(2, original.length - 2).split(displaTextSeparator);
	return {
		link: parts[0],
		position: {
			start: {
				col: startIdx,
				line: pos.line,
				offset: -1,
			},
			end: {
				col: endIdx,
				line: pos.line,
				offset: -1,
			},
		},
		original,
		//keep displayText undefined in case the link contains no display text, just link name
		displayText: parts[1],
	};
}

type LookupFn = (count: number) => string;

export function firstIndexOf(str: string, from: number, predicate: (lookup: LookupFn) => boolean): number {
	const len = str.length;
	const lookupFn: LookupFn = (count) => {
		return str.substring(from, Math.min(from + count, len));
	};
	while (from < len) {
		if (predicate(lookupFn)) {
			return from;
		}
		from++;
	}
	return -1;
}

export function lastIndexOf(str: string, from: number, predicate: (lookup: LookupFn) => boolean): number {
	const len = str.length;
	const lookupFn: LookupFn = (count) => {
		return str.substring(from, Math.min(from + count, len));
	};
	while (from > 0) {
		from--;
		if (predicate(lookupFn)) {
			return from;
		}
	}
	return -1;
}

/**
 *
 * @param link
 * @returns Pos of link text where the Pos.start points to the link pipe character
 */
export function getLinkTextPosWithPipe(link: ReferenceCache): Pos {
	//empty string in display text should be handled here too
	if (link.displayText != null) {
		return {
			start: moveLoc(link.position.end, -link.displayText.length - 3),
			end: moveLoc(link.position.end, -2),
		};
	}
	return {
		start: moveLoc(link.position.end, -2),
		end: moveLoc(link.position.end, -2),
	};
}

/**
 * Sets the link text of `link` to be a `linkText`
 * @param link
 * @param editor
 * @param linkText
 */
export function setLinkText(link: ReferenceCache, editor: Editor, linkText: string): void {
	if (link.displayText !== linkText) {
		//it was changed rollback the change now
		const linkTextPos = getLinkTextPosWithPipe(link);
		editor.replaceRange(`|${linkText}`, locToEditorPositon(linkTextPos.start), locToEditorPositon(linkTextPos.end));
		link.displayText = linkText;
	}
}
