import { capitalize } from "../src/Utils";

describe("", () => {
	it("uppercase first letter from 3", () => {
		expect(capitalize("abc")).toEqual("Abc");
	});
	it("Uppercase one letter", () => {
		expect(capitalize("a")).toEqual("A");
	});
	it("Uppercase empty string", () => {
		expect(capitalize("")).toEqual("");
	});
	it("Uppercase whitespace", () => {
		expect(capitalize(" a")).toEqual(" a");
	});
});
