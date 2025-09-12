import { Contracts, ReadOnlyWallet } from "@/app/lib/profiles";
import { env, getMainsailProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

import { renderHook } from "@testing-library/react";
import { truncate } from "@/app/lib/helpers";
import { useSearchParametersValidation } from "./use-search-parameters-validation";

let profile: Contracts.IProfile;

const requiredParameters = {
	coin: "Mainsail",
	nethash: "1",
	network: "mainsail.devnet",
};

describe("useSearchParametersValidation", () => {
	beforeAll(() => {
		process.env.MOCK_AVAILABLE_NETWORKS = "false";
		profile = env.profiles().findById(getMainsailProfileId());

		mockProfileWithPublicAndTestNetworks(profile);
	});

	it("should validate search parameters without errors (with network)", async () => {
		const parameters = new URLSearchParams(
			"amount=10&coin=mainsail&method=transfer&network=mainsail.devnet&recipient=0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();
	});

	it("should validate search parameters without errors (with nethash)", async () => {
		const parameters = new URLSearchParams(
			"coin=mainsail&method=transfer&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();
	});

	it("should use default if coin is missing", async () => {
		const parameters = new URLSearchParams("method=transfer&network=mainsail.devnet");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();
	});

	it("should return error for missing method", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MISSING_METHOD" },
		});
	});

	it("should return error for invalid method", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet&method=custom");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "METHOD_NOT_SUPPORTED", value: "custom" },
		});
	});

	it("should return error for missing network or nethash", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MISSING_NETWORK_OR_NETHASH" },
		});
	});

	it("should return error for invalid network", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&network=custom&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETWORK_INVALID", value: "custom" },
		});
	});

	it("should return error for disabled network", async () => {
		const networkSpy = vi
			.spyOn(profile, "availableNetworks")
			.mockReturnValue(profile.availableNetworks().filter((network) => network.id() === "mainsail.mainnet"));

		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETWORK_NOT_ENABLED", value: "Mainsail Devnet" },
		});

		networkSpy.mockRestore();
	});

	it("should return error for invalid nethash", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&nethash=custom&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETHASH_NOT_ENABLED", value: "custom" },
		});
	});

	it("should return error for network mismatch", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&method=transfer&network=mainsail.devnet");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				coin: "MAINSAIL",
				nethash: undefined,
				network: "custom",
			}),
		).resolves.toStrictEqual({ error: { type: "NETWORK_MISMATCH" } });
	});

	it("should return error for nethash mismatch", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&nethash=1&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				coin: "MAINSAIL",
				nethash: "wrong",
				network: undefined,
			}),
		).resolves.toStrictEqual({ error: { type: "NETWORK_MISMATCH" } });
	});

	it("should return error if recipient does not correspond to network", async () => {
		const parameters = new URLSearchParams(
			"coin=mainsail&network=mainsail.devnet&method=transfer&recipient=custom",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "INVALID_ADDRESS_OR_NETWORK_MISMATCH" },
		});
	});

	describe("Message Verification", () => {
		it("should validate verify message", async () => {
			const parameters = new URLSearchParams(
				"coin=Mainsail&network=mainsail.devnet&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			const { result } = renderHook(() => useSearchParametersValidation());

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
		});

		it("should generate verify message path", () => {
			const parameters = new URLSearchParams(
				"coin=Mainsail&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			const { result } = renderHook(() => useSearchParametersValidation());

			expect(
				result.current.methods.verify.path({
					env,
					network: profile.wallets().first().network(),
					profile,
					searchParameters: parameters,
				}),
			).toBe(
				`/profiles/${profile.id()}/verify-message?coin=Mainsail&nethash=${
					profile.wallets().first().network().meta().nethash
				}&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d`,
			);
		});

		it("should throw if message, signatory or signature is missing", async () => {
			const { result } = renderHook(() => useSearchParametersValidation());

			let parameters = new URLSearchParams(
				"coin=Mainsail&network=mainsail.devnet&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
				error: { type: "MISSING_MESSAGE" },
			});

			parameters = new URLSearchParams(
				"coin=Mainsail&network=mainsail.devnet&method=verify&message=hello+world&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
				error: { type: "MISSING_SIGNATORY" },
			});

			parameters = new URLSearchParams(
				"coin=Mainsail&network=mainsail.devnet&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca",
			);

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
				error: { type: "MISSING_SIGNATURE" },
			});
		});
	});

	it("should throw if sign and no message", async () => {
		const parameters = new URLSearchParams(
			"coin=Mainsail&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114&method=sign",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MESSAGE_MISSING" },
		});
	});

	it("should validate sign", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=test",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
	});

	it("should generate sign message path", () => {
		const parameters = new URLSearchParams(
			"coin=Mainsail&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114&method=sign&message=test",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(
			result.current.methods.sign.path({
				env,
				network: profile.wallets().first().network(),
				profile,
				searchParameters: parameters,
			}),
		).toBe(
			`/profiles/${profile.id()}/dashboard?method=sign&coin=Mainsail&nethash=${
				profile.wallets().first().network().meta().nethash
			}&message=test`,
		);
	});

	it("should throw for invalid address if sign with invalid address", async () => {
		const parameters = new URLSearchParams(
			"coin=mainsail&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114&method=sign&message=hello&address=1",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "INVALID_ADDRESS_OR_NETWORK_MISMATCH" },
		});
	});

	it("should validate vote", async () => {
		const mockFindDelegateByName = vi
			.spyOn(profile.validators(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams(
			"coin=mainsail&network=mainsail.devnet&method=vote&validator=genesis_31",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();

		mockFindDelegateByName.mockRestore();
	});

	it("should validate vote using legacy delegate key", async () => {
		const mockFindDelegateByName = vi
			.spyOn(profile.validators(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams(
			"method=vote&delegate=genesis_31&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();

		mockFindDelegateByName.mockRestore();
	});

	it("should find delegate by public key", async () => {
		const mockFindDelegateByPublicKey = vi
			.spyOn(profile.validators(), "findByPublicKey")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet&method=vote&publicKey=1");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();

		mockFindDelegateByPublicKey.mockRestore();
	});

	it("should fail to find validator by public key", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet&method=vote&publicKey=1");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "VALIDATOR_NOT_FOUND", value: "1" },
		});
	});

	it("should not allow both validator name and public keys in the url", async () => {
		const parameters = new URLSearchParams(
			"coin=Mainsail&network=mainsail.devnet&method=vote&publicKey=1&validator=test",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "AMBIGUOUS_VALIDATOR" },
		});
	});

	it("should fail to validate validator address", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet&method=vote&validator=custom");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "VALIDATOR_NOT_FOUND", value: "custom" },
		});
	});

	it("should accept a valid address", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=hello&address=DL8d1p4XL1k4VvkQfZp2PBx38epXdm1Tve",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
	});

	it("should require delegate parameter if it is a vote link", async () => {
		const parameters = new URLSearchParams("coin=Mainsail&network=mainsail.devnet&method=vote");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MISSING_VALIDATOR" },
		});
	});

	it("should fail if delegate is resigned", async () => {
		const validatorWallet = new ReadOnlyWallet(
			{
				address: profile.wallets().first().address(),
				explorerLink: "",
				governanceIdentifier: "address",
				isResignedValidator: false,
				isValidator: true,
				publicKey: profile.wallets().first().publicKey(),
				rank: 52,
				username: "testi",
			},
			profile,
		);
		const mockFindDelegateByPublicKey = vi
			.spyOn(profile.validators(), "findByPublicKey")
			.mockReturnValue(validatorWallet);

		const resignedMock = vi.spyOn(validatorWallet, "isResignedValidator").mockReturnValue(true);

		const parameters = new URLSearchParams(
			`coin=Mainsail&network=mainsail.devnet&method=vote&publicKey=${validatorWallet.publicKey()}`,
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: {
				type: "VALIDATOR_RESIGNED",
				value: truncate(validatorWallet.publicKey(), { length: 20, omissionPosition: "middle" }),
			},
		});

		mockFindDelegateByPublicKey.mockRestore();
		resignedMock.mockRestore();
	});

	it("should generate send transfer path", () => {
		const parameters = new URLSearchParams(
			"method=transfer&coin=mainsail&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(
			result.current.methods.transfer.path({
				env,
				network: profile.wallets().first().network(),
				profile,
				searchParameters: parameters,
			}),
		).toBe(
			`/profiles/${profile.id()}/dashboard?method=transfer&coin=mainsail&nethash=${
				profile.wallets().first().network().meta().nethash
			}`,
		);
	});

	it("should generate send vote path", () => {
		const parameters = new URLSearchParams(
			"coin=mainsail&method=vote&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114&delegate=test",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		expect(
			result.current.methods.vote.path({
				env,
				network: profile.wallets().first().network(),
				profile,
				searchParameters: parameters,
			}),
		).toBe(
			`/profiles/${profile.id()}/send-vote?coin=mainsail&method=vote&nethash=${
				profile.wallets().first().network().meta().nethash
			}&delegate=test&vote=undefined`,
		);
	});

	it("should return error if no available wallets found in network (with network)", async () => {
		const mockAvailableWallets = vi.spyOn(profile.wallets(), "values").mockReturnValue([]);
		const walletCountMock = vi.spyOn(profile.wallets(), "count").mockReturnValue(0);

		const parameters = new URLSearchParams(
			"amount=10&coin=mainsail&method=transfer&network=mainsail.devnet&recipient=0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETWORK_NO_WALLETS", value: "Mainsail Devnet" },
		});

		mockAvailableWallets.mockRestore();
		walletCountMock.mockRestore();
	});

	it("should return error if no available wallets found in network (with nethash)", async () => {
		const walletCountMock = vi.spyOn(profile.wallets(), "count").mockReturnValue(0);
		const mockAvailableWallets = vi.spyOn(profile.wallets(), "values").mockReturnValue([]);

		const parameters = new URLSearchParams(
			"coin=mainsail&method=transfer&nethash=560f869ed6713745a12328e7214cb65077e645bb5e57b1e5b323bb915a51f114",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: {
				type: "NETWORK_NO_WALLETS",
				value: "Mainsail Devnet",
			},
		});

		mockAvailableWallets.mockRestore();
		walletCountMock.mockRestore();
	});

	it("should build uri error message", () => {
		const { result } = renderHook(() => useSearchParametersValidation());

		expect(result.current.buildSearchParametersError({ type: "AMBIGUOUS_VALIDATOR" })).toMatchInlineSnapshot(`
			<Trans
			  i18nKey="TRANSACTION.VALIDATION.VALIDATOR_OR_PUBLICKEY"
			  parent={[Function]}
			/>
		`);
	});

	it("should build qr error message", () => {
		const { result } = renderHook(() => useSearchParametersValidation());

		expect(
			result.current.buildSearchParametersError({ coin: "custom", type: "COIN_NOT_SUPPORTED" }, true),
		).toMatchInlineSnapshot(`<WrapperURI />`);
	});
});
