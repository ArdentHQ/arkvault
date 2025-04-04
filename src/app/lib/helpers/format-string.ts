export const formatString = (...arguments_: any[]): string => {
	let output: string = arguments_[0];

	arguments_.shift();

	for (const [index, element] of arguments_.entries()) {
		output = output.replace(`{${index}}`, element);
	}

	return output;
};
