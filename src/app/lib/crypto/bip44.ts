interface BIP44Levels {
	purpose: number;
	coinType: number;
	account: number;
	change: number;
	addressIndex: number;
}

export class BIP44 {
	public static parse(path: string): BIP44Levels {
		if (!new RegExp("^((m/)?((44|49|84)'?))(/\\d+'?){2}((/\\d+){2})?$", "g").test(path)) {
			throw new Error(path);
		}

		const result: number[] = [];
		for (const level of path.replace("m/", "").split("/")) {
			result.push(+level.replace("'", ""));
		}

		return {
			account: result[2],
			addressIndex: result[4],
			change: result[3],
			coinType: result[1],
			purpose: result[0],
		};
	}

	public static stringify(options: {
		purpose?: number;
		coinType: number;
		account?: number;
		change?: number;
		index?: number;
	}): string {
		return `m/${options.purpose || 44}'/${options.coinType}'/${options.account || 0}'/${options.change || 0}/${
			options.index || 0
		}`;
	}
}
