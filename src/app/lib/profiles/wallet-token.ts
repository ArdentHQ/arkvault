import { Contracts } from ".";
import { Networks } from "@/app/lib/mainsail";
import { TokenDTO } from "./token.dto";
import { WalletTokenDTO } from "./wallet-token.dto";
import { BigNumber } from "@/app/lib/helpers";
import { LinkService } from "@/app/lib/mainsail/link.service";

export class WalletToken {
	#token: TokenDTO;
	#walletToken: WalletTokenDTO;
	#linkService: LinkService;

	constructor({
		walletToken,
		token,
		profile,
		network,
	}: {
		walletToken: WalletTokenDTO;
		token: TokenDTO;
		profile: Contracts.IProfile;
		network: Networks.Network;
	}) {
		this.#walletToken = walletToken;
		this.#token = token;
		this.#linkService = new LinkService({ config: network.config(), profile });
	}

	address(): string {
		return this.#walletToken.address();
	}

	balance(): number {
		return +BigNumber.make(this.#walletToken.balance(), this.token().decimals()).toHuman();
	}

	token(): TokenDTO {
		return this.#token;
	}

	contractExplorerLink(): string {
		return this.#linkService.wallet(this.token().address());
	}
}
