import { Editor, ReferenceCache } from "obsidian";
import { getReferenceCacheFromEditor } from "../src/MarkdownUtils";

describe("MarkdownUtils", () => {
	it("getReferenceCacheFromEditor link only", () => {
		const linkText = "[[target|text]]";
		const cacheLink = getReferenceCacheFromEditor(createEditorWithCursor(7, 0, `${linkText}`));
		if (!cacheLink) {
			throw new Error();
		}
		expect(linkText.substring(cacheLink.position.start.col, cacheLink?.position.end.col)).toBe(linkText);
		expect(cacheLink).toEqual({
			link: "target",
			original: "[[target|text]]",
			displayText: "text",
			position: {
				start: {
					line: 7,
					col: 0,
					offset: -1,
				},
				end: {
					line: 7,
					col: 15,
					offset: -1,
				},
			},
		} as ReferenceCache);
	});
	const linkText = "[[target|text]]";
	const line = `something before ${linkText} and after`;
	const startOff = line.indexOf(linkText);
	const endOff = startOff + linkText.length;
	let o = 0;
	while (o <= line.length) {
		const off = o;
		if (off >= startOff && off < endOff) {
			it(`getReferenceCacheFromEditor off=${off} returns value`, () => {
				const cacheLink = getReferenceCacheFromEditor(createEditorWithCursor(7, off, line));
				if (!cacheLink) {
					throw new Error();
				}
				// expect(linkText.substring(cacheLink.position.start.col, cacheLink?.position.end.col)).toBe(linkText);
				expect(cacheLink).toEqual({
					link: "target",
					original: "[[target|text]]",
					displayText: "text",
					position: {
						start: {
							line: 7,
							col: startOff,
							offset: -1,
						},
						end: {
							line: 7,
							col: endOff,
							offset: -1,
						},
					},
				} as ReferenceCache);
			});
		} else {
			it(`getReferenceCacheFromEditor off=${off} returns undefined`, () => {
				const cacheLink = getReferenceCacheFromEditor(createEditorWithCursor(7, off, line));
				expect(cacheLink).toBeUndefined();
			});
		}
		o++;
	}
});

function createEditorWithCursor(line: number, ch: number, lineText: string): Editor {
	const ed: Partial<Editor> = {
		getCursor() {
			return {
				line,
				ch,
			};
		},
		getLine(line2?: number) {
			if (line2 !== line) {
				throw new Error("Unexpected getLine call");
			}
			return lineText;
		},
	};
	return ed as Editor;
}
