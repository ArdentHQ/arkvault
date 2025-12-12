import { TokenDTO } from "./token.dto";
import { WalletTokenDTO } from "./wallet-token.dto";

export class WalletToken {
	#token: TokenDTO;
	#walletToken: WalletTokenDTO;

	constructor({ walletToken, token }: { walletToken: WalletTokenDTO, token: TokenDTO }) {
		this.#walletToken = walletToken;
		this.#token = token;
	}

	address(): string {
		return this.#walletToken.address()
	}

	balance(): number {
		return this.#walletToken.balance()
	}

	token(): TokenDTO {
		return this.#token
	}
}
