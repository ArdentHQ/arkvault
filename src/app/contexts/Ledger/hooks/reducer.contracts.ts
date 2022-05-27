export type OfUnion<T extends { type: string }> = {
	[P in T["type"]]: Extract<T, { type: P }>;
};
export type Handlers<T, K> = {
	[P in keyof T]: (action: T[P]) => K;
};
