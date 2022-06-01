type JoinToPath<K, P> = K extends string | number
	? P extends string | number
		? `${K}${"" extends P ? "" : "."}${P}`
		: never
	: never;

type PreviousIndex = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

export type NestedLeaves<T, D extends number = 10> = [D] extends [never]
	? never
	: T extends object
	? { [K in keyof T]-?: JoinToPath<K, NestedLeaves<T[K], PreviousIndex[D]>> }[keyof T]
	: "";
