import { generateMnemonic, validateMnemonic, mnemonicToSeedSync, mnemonicToEntropy } from "@scure/bip39";

import { wordlist as czech } from "@scure/bip39/wordlists/czech";
import { wordlist as english } from "@scure/bip39/wordlists/english";
import { wordlist as french } from "@scure/bip39/wordlists/french";
import { wordlist as italian } from "@scure/bip39/wordlists/italian";
import { wordlist as japanese } from "@scure/bip39/wordlists/japanese";
import { wordlist as korean } from "@scure/bip39/wordlists/korean";
import { wordlist as chineseSimplified } from "@scure/bip39/wordlists/simplified-chinese";
import { wordlist as chineseTraditional } from "@scure/bip39/wordlists/traditional-chinese";
import { wordlist as spanish } from "@scure/bip39/wordlists/spanish";
import { wordlist as portuguese } from "@scure/bip39/wordlists/portuguese";

const wordlists = {
	chinese_simplified: chineseSimplified,
	chinese_traditional: chineseTraditional,
	czech,
	english,
	french,
	italian,
	japanese,
	korean,
	portuguese,
	spanish,
};

const getWordList = (locale: string): string[] => wordlists[locale] || wordlists.english;

export class BIP39 {
	public static generate(locale = "english", wordCount?: number): string {
		const strength = wordCount === 24 ? 256 : 128;
		return generateMnemonic(getWordList(locale), strength);
	}

	public static validate(mnemonic: string, locale = "english"): boolean {
		return validateMnemonic(BIP39.normalize(mnemonic), getWordList(locale));
	}

	public static compatible(mnemonic: string): boolean {
		const locales: string[] = [
			"english",
			"chinese_simplified",
			"chinese_traditional",
			"czech",
			"french",
			"italian",
			"japanese",
			"korean",
			"portuguese",
			"spanish",
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
		return mnemonicToEntropy(BIP39.normalize(mnemonic), getWordList(locale));
	}

	public static normalize(mnemonic: string): string {
		return mnemonic.normalize("NFD");
	}
}
