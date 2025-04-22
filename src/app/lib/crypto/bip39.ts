import { generateMnemonic, validateMnemonic, mnemonicToSeedSync, mnemonicToEntropy } from "@scure/bip39";
import { wordlist as czech } from "@scure/bip39/wordlists/czech";
import { wordlist as english } from "@scure/bip39/wordlists/english";
import { wordlist as french } from "@scure/bip39/wordlists/french";
import { wordlist as italian } from "@scure/bip39/wordlists/italian";
import { wordlist as japanese } from "@scure/bip39/wordlists/japanese";
import { wordlist as korean } from "@scure/bip39/wordlists/korean";
import { wordlist as portuguese } from "@scure/bip39/wordlists/portuguese";
import { wordlist as simplifiedChinese } from "@scure/bip39/wordlists/simplified-chinese";
import { wordlist as spanish } from "@scure/bip39/wordlists/spanish";
import { wordlist as traditionalChinese } from "@scure/bip39/wordlists/traditional-chinese";

const WORDLISTS: Record<string, string[]> = {
	czech,
	english,
	french,
	italian,
	japanese,
	korean,
	portuguese,
	spanish,
};

const getWordlist = (locale: string): string[] => {
	switch (locale) {
		case "chinese_simplified": {
			return simplifiedChinese;
		}
		case "chinese_traditional": {
			return traditionalChinese;
		}
		default: {
			return WORDLISTS[locale] || english;
		}
	}
};

export class BIP39 {
	public static generate(locale = "english", wordCount?: number): string {
		const strength = wordCount === 24 ? 256 : 128;
		return generateMnemonic(getWordlist(locale), strength);
	}

	public static validate(mnemonic: string, locale = "english"): boolean {
		return validateMnemonic(BIP39.normalize(mnemonic), getWordlist(locale));
	}

	public static compatible(mnemonic: string): boolean {
		const locales = [
			"english",
			"czech",
			"french",
			"italian",
			"japanese",
			"korean",
			"portuguese",
			"spanish",
			"chinese_simplified",
			"chinese_traditional",
		];

		for (const locale of locales) {
			if (BIP39.validate(mnemonic, locale)) {
				return true;
			}
		}

		return false;
	}

	public static toSeed(mnemonic: string): Uint8Array {
		return mnemonicToSeedSync(BIP39.normalize(mnemonic));
	}

	public static toEntropy(mnemonic: string, locale = "english"): Uint8Array {
		return mnemonicToEntropy(BIP39.normalize(mnemonic), getWordlist(locale));
	}

	public static normalize(mnemonic: string): string {
		return mnemonic.normalize("NFKD");
	}
}
