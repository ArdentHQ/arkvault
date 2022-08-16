type UseLinkHook = () => { openExternal: (value: string) => void; openMailto: (value: string) => void };

export const useLink: UseLinkHook = () => ({
	openExternal: (value: string) => {
		if (!/^https?:\/\//.test(value)) {
			throw new Error(`"${value}" is not a valid URL`);
		}

		const url = new URL(value);
		window.open(url.toString(), "_blank");
	},
	openMailto: (value: string) => {
		if (!value.startsWith("mailto")) {
			throw new Error(`"${value}" is not a valid mailto URL`);
		}

		location.href = value;
	},
});
