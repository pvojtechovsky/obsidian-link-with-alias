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
