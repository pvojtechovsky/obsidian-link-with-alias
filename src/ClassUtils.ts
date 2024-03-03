import { Plugin } from "obsidian";

interface JSClass {
	name: string;
	prototype: Record<string, any>;
}

interface JSObject {
	constructor: JSClass;
}

export function isJSObject(obj: unknown): obj is JSObject {
	if (typeof obj == "object" && obj != null && "constructor" in obj) {
		const cls = obj.constructor;
		if (typeof cls == "function" && cls != null && "name" in cls && "prototype" in cls) {
			return true;
		}
	}
	return false;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(obj: unknown): obj is Function {
	return typeof obj == "function";
}

export function overrideMethod<R>(
	plugin: Plugin,
	instance: unknown,
	methodName: string,
	code: (superFnc: (...args: any[]) => R, ...args: any[]) => R,
): void {
	if (!isJSObject(instance)) {
		throw new Error("Cannot override non class instance");
	}
	const originMethod = instance.constructor.prototype[methodName];
	if (!isFunction(originMethod)) {
		throw new Error("Cannot override non function");
	}
	instance.constructor.prototype[methodName] = function (...args: any[]): R {
		const superCode: (...args2: any[]) => R = (...args2) => {
			return originMethod.apply(this, args2);
		};
		return code(superCode, ...args);
	};
	plugin.register(() => {
		instance.constructor.prototype[methodName] = originMethod;
	});
}
