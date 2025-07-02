export const createRange = (start: number, size: number) =>
	Array.from({ length: size }, (_, index) => index + size * start);
