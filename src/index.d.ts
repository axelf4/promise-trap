type PromiseTrap<T extends object>
	= { [K in keyof T | "all"]: K extends "all" ? () => Promise<undefined> : T[K] }
	& (T extends ((...args: infer A) => infer R) ? (...args: A) => R : unknown);

declare function promiseTrap<T extends object>(target: T): PromiseTrap<T>;

export = promiseTrap;
