export const debounceAsync = <T>(callback: Function, delay: number): ((...arguments_: any[]) => Promise<T>) => {
	let timeout: any;

	return async function (...arguments_: any) {
		return new Promise<T>((resolve) => {
			clearTimeout(timeout);
			timeout = setTimeout(async () => {
				// @ts-ignore
				const response = await callback.apply(this, arguments_);
				resolve(response);
			}, delay);
		});
	};
};
