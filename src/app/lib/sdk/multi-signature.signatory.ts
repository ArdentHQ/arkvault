import { MultiSignatureAsset } from "./services";

export class MultiSignatureSignatory {
	readonly #asset: MultiSignatureAsset;
	readonly #address: string;

	public constructor(asset: MultiSignatureAsset, address: string) {
		this.#asset = asset;
		this.#address = address;
	}

	public asset(): MultiSignatureAsset {
		return this.#asset;
	}

	public address(): string {
		return this.#address;
	}
}
