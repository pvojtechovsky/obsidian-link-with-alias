import { Editor, EditorPosition, ReferenceCache } from "obsidian";

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
		displayText: parts[1] || parts[0],
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
