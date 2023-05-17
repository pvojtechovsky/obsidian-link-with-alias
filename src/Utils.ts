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
