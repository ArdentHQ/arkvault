import { describe, it, expect, beforeEach } from "vitest";

import { WalletTokenDTO } from "./wallet-token.dto";
import { TokenDTO } from "./token.dto";
import Fixtures from "@/tests/fixtures/coins/mainsail/devnet/tokens.json";
import { WalletToken } from "./wallet-token";
import { Contracts } from "@/app/lib/profiles";
import { env, getMainsailProfileId } from "@/utils/testing-library";

let profile: Contracts.IProfile;

describe("WalletToken", () => {
	let walletTokenDTO: WalletTokenDTO;
	let tokenDTO: TokenDTO;
	let walletToken: WalletToken;

	const fixtureData = Fixtures.ByContractAddress.data;
	const walletTokenData = Fixtures.ByWalletAddress.data[0];

	beforeEach(() => {
		profile = env.profiles().findById(getMainsailProfileId());
		walletTokenDTO = new WalletTokenDTO(walletTokenData);
		tokenDTO = new TokenDTO(fixtureData);
		walletToken = new WalletToken({ token: tokenDTO, walletToken: walletTokenDTO, profile, network: profile.activeNetwork() });
	});

	it("#address", () => {
		expect(walletToken.address()).toBe(walletTokenDTO.address());
	});

	it("#balance", () => {
		expect(walletToken.balance()).toBe(100000000);
	});

	it("#token", () => {
		expect(walletToken.token()).toBe(tokenDTO);
	});

	it("#contractExplorerLink", () => {
		expect(walletToken.contractExplorerLink()).toBe("https://explorer-demo.mainsailhq.com/addresses/0xdeb478251073157e400c3d8d2ed92a85c958f9fa");
	});

	describe("TokenDTO", () => {
		it("#address", () => {
			expect(tokenDTO.address()).toBe(fixtureData.address);
		});

		it("#decimals", () => {
			expect(tokenDTO.decimals()).toBe(fixtureData.decimals);
		});

		it("#deploymentHash", () => {
			expect(tokenDTO.deploymentHash()).toBe(fixtureData.deploymentHash);
		});

		it("#name", () => {
			expect(tokenDTO.name()).toBe(fixtureData.name);
		});

		it("#symbol", () => {
			expect(tokenDTO.symbol()).toBe(fixtureData.symbol);
		});

		it("#totalSupply", () => {
			expect(tokenDTO.totalSupply()).toBe(fixtureData.totalSupply);
		});


		it("#toJSON", () => {
			expect(tokenDTO.toJSON()).toEqual(fixtureData);
		});

		it("should be accessible through walletToken.token()", () => {
			const walletToken = new WalletToken({ token: tokenDTO, walletToken: new WalletTokenDTO(fixtureData), profile, network: profile.activeNetwork() });
			expect(walletToken.token().address()).toBe(tokenDTO.address());
			expect(walletToken.token().decimals()).toBe(tokenDTO.decimals());
			expect(walletToken.token().deploymentHash()).toBe(tokenDTO.deploymentHash());
			expect(walletToken.token().name()).toBe(tokenDTO.name());
			expect(walletToken.token().symbol()).toBe(tokenDTO.symbol());
			expect(walletToken.token().totalSupply()).toBe(tokenDTO.totalSupply());
			expect(walletToken.token().toJSON()).toEqual(tokenDTO.toJSON());
		});
	});
});
