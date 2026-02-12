import { Contracts } from "@/app/lib/profiles";
import React from "react";

import { env, render, screen, getMainsailProfileId } from "@/utils/testing-library";
import { expect } from "vitest";
import { TokensSummary } from "./TokensSummary";
import { WalletTokenRepository } from "@/app/lib/profiles/wallet-token.repository";
import { WalletTokenDTO } from "@/app/lib/profiles/wallet-token.dto";
import { TokenDTO } from "@/app/lib/profiles/token.dto";

const fixtureProfileId = getMainsailProfileId();

describe("TokensSummary", () => {
	let profile: Contracts.IProfile;
	let wallet: Contracts.IReadWriteWallet;

	beforeEach(async () => {
		profile = env.profiles().findById(fixtureProfileId);
		wallet = profile.wallets().first();
	});

	it("should render", async () => {
		vi.spyOn(wallet, "tokenCount").mockReturnValue(2);

		render(<TokensSummary wallet={wallet} />);

		expect(screen.getByTestId("TokensSummary")).toBeInTheDocument();
	});

	it("should display count when there are more than 3 tokens", async () => {
		vi.spyOn(wallet, "tokenCount").mockReturnValue(25);
		vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(25);

		render(<TokensSummary wallet={wallet} />);

		expect(screen.getByTestId("TokensSummary")).toBeInTheDocument();
		expect(screen.getByTestId("TokensSummary--Count")).toBeInTheDocument();
	});


	it("should sort tokens by balance", async () => {
		vi.spyOn(profile.tokens(), "selectedCount").mockReturnValue(4);

		const repo = new WalletTokenRepository(profile.activeNetwork(), profile);

		repo.create({
			token: new TokenDTO({
				address: "0xabc",
				decimals: 18,
				deploymentHash: "0xabc",
				name: "ABC",
				symbol: "ABC",
				totalSupply: "10000",
			}),
			walletToken: new WalletTokenDTO({
				address: wallet.address(),
				balance: '100',
				tokenAddress: "0xabc",
			})
		});

		repo.create({
			token: new TokenDTO({
				address: "0xabd",
				decimals: 18,
				deploymentHash: "0xabd",
				name: "DEF",
				symbol: "DEF",
				totalSupply: "20000",
			}),
			walletToken: new WalletTokenDTO({
				address: wallet.address(),
				balance: '200',
				tokenAddress: "0xabd",
			})
		});

		repo.create({
			token: new TokenDTO({
				address: "0xabe",
				decimals: 18,
				deploymentHash: "0xabe",
				name: "PET",
				symbol: "PET",
				totalSupply: "30000",
			}),
			walletToken: new WalletTokenDTO({
				address: wallet.address(),
				balance: '300',
				tokenAddress: "0xabe",
			})
		});

		repo.create({
			token: new TokenDTO({
				address: "0xabf",
				decimals: 18,
				deploymentHash: "0xabf",
				name: "HOF",
				symbol: "HOF",
				totalSupply: "40000",
			}),
			walletToken: new WalletTokenDTO({
				address: wallet.address(),
				balance: '300',
				tokenAddress: "0xabf",
			})
		});

		vi.spyOn(wallet, "tokens").mockReturnValue(repo);

		render(<TokensSummary wallet={wallet} />);

		expect(screen.getByTestId("TokensSummary")).toBeInTheDocument();
		expect(screen.getAllByTestId("TokeNameInitials")[0]).toHaveTextContent("D")
		expect(screen.getAllByTestId("TokeNameInitials")[1]).toHaveTextContent("H")
		expect(screen.getAllByTestId("TokeNameInitials")[2]).toHaveTextContent("P")
	});
});
