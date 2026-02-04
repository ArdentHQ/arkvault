import { describe, beforeAll, it } from "vitest";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { Contracts } from "@/app/lib/profiles";
import { TransactionEncoder } from "./transaction-encoder";
import { WalletTokenDTO } from "../profiles/wallet-token.dto";
import { TokenDTO } from "../profiles/token.dto";
import { WalletToken } from "../profiles/wallet-token";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";

let profile: Contracts.IProfile;

describe("TransactionEncoder", () => {
	let walletTokenDTO: WalletTokenDTO;
	let tokenDTO: TokenDTO;
	let walletToken: WalletToken;

	beforeAll(async () => {
		const fixtureData = Fixtures.ByContractAddress.data;
		const walletTokenData = Fixtures.ByWalletAddress.data[0];

		profile = env.profiles().findById(getMainsailProfileId());

		walletTokenDTO = new WalletTokenDTO(walletTokenData);
		tokenDTO = new TokenDTO(fixtureData);
		walletToken = new WalletToken({
			network: profile.activeNetwork(),
			profile,
			token: tokenDTO,
			walletToken: walletTokenDTO,
		});
		vi.spyOn(profile.tokens().selected(), "items").mockReturnValue([walletToken])
	});

	const tokenEncodedData = {
		data: "0xa9059cbb000000000000000000000000deb478251073157e400c3d8d2ed92a85c958f9fa0000000000000000000000000000000000000000000000056bc75e2d63100000",
		to: "0xdeb478251073157e400c3d8d2ed92a85c958f9fa",
	};

	it("should encode token transfer", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address()

		expect(
			encoder.tokenTransfer(address, { recipients: [{ address, amount: 100 }], senderAddress: address, tokenContractAddress: address }),
		).toEqual(tokenEncodedData);
	});

	it("should get token transfer if token info is provided", async () => {
		const encoder = new TransactionEncoder(profile, profile.activeNetwork());
		const address = walletToken.token().address()

		expect(
			encoder.byType(
				{ recipients: [{ address, amount: 100 }], senderAddress: address, tokenContractAddress: address },
				"transfer",
			),
		).toEqual(tokenEncodedData);
	});
});
