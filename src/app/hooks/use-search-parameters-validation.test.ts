import { Contracts, ReadOnlyWallet } from "@ardenthq/sdk-profiles";
import { renderHook } from "@testing-library/react";

import { truncate } from "@ardenthq/sdk-helpers";
import { useSearchParametersValidation } from "./use-search-parameters-validation";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

let profile: Contracts.IProfile;

const requiredParameters = {
	coin: "ARK",
	nethash: "1",
	network: "ark.devnet",
};

describe("useSearchParametersValidation", () => {
	beforeAll(() => {
		profile = env.profiles().findById(getDefaultProfileId());

		mockProfileWithPublicAndTestNetworks(profile);
	});

	it("should validate search parameters without errors (with network)", async () => {
		const parameters = new URLSearchParams(
			"amount=10&coin=ark&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();
	});

	it("should validate search parameters without errors (with nethash)", async () => {
		const parameters = new URLSearchParams(
			"coin=ark&method=transfer&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();
	});

	it("should use default if coin is missing", async () => {
		const parameters = new URLSearchParams("method=transfer&network=ark.devnet");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();
	});

	it("should return error for invalid coin", async () => {
		const parameters = new URLSearchParams("coin=custom&network=ark.devnet&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "COIN_NOT_SUPPORTED", value: "CUSTOM" },
		});
	});

	it("should return error for coin mismatch", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=1&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				coin: "custom",
			}),
		).resolves.toStrictEqual({ error: { type: "COIN_MISMATCH" } });
	});

	it("should return error for missing method", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MISSING_METHOD" },
		});
	});

	it("should return error for invalid method", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=custom");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "METHOD_NOT_SUPPORTED", value: "custom" },
		});
	});

	it("should return error for missing network or nethash", async () => {
		const parameters = new URLSearchParams("coin=ARK&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MISSING_NETWORK_OR_NETHASH" },
		});
	});

	it("should return error for invalid network", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=custom&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETWORK_INVALID", value: "custom" },
		});
	});

	it("should return error for disabled network", async () => {
		const networkSpy = vi
			.spyOn(profile, "availableNetworks")
			.mockReturnValue(profile.availableNetworks().filter((network) => network.id() === "ark.mainnet"));

		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETWORK_NOT_ENABLED", value: "ARK Devnet" },
		});

		networkSpy.mockRestore();
	});

	it("should return error for invalid nethash", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=custom&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETHASH_NOT_ENABLED", value: "custom" },
		});
	});

	it("should return error for network mismatch", async () => {
		const parameters = new URLSearchParams("coin=ark&method=transfer&network=ark.devnet");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				nethash: undefined,
				network: "custom",
			}),
		).resolves.toStrictEqual({ error: { type: "NETWORK_MISMATCH" } });
	});

	it("should return error for nethash mismatch", async () => {
		const parameters = new URLSearchParams("coin=ARK&nethash=1&method=transfer");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(
			result.current.validateSearchParameters(profile, env, parameters, {
				...requiredParameters,
				nethash: "wrong",
				network: undefined,
			}),
		).resolves.toStrictEqual({ error: { type: "NETWORK_MISMATCH" } });
	});

	it("should return error if recipient does not correspond to network", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=transfer&recipient=custom");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "INVALID_ADDRESS_OR_NETWORK_MISMATCH" },
		});
	});

	describe("Message Verification", () => {
		it("should validate verify message", async () => {
			const parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			const { result } = renderHook(() => useSearchParametersValidation());

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.not.toThrow();
		});

		it("should generate verify message path", () => {
			const parameters = new URLSearchParams(
				"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
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
				`/profiles/${profile.id()}/verify-message?coin=ARK&nethash=${
					profile.wallets().first().network().meta().nethash
				}&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d`,
			);
		});

		it("should throw if message, signatory or signature is missing", async () => {
			const { result } = renderHook(() => useSearchParametersValidation());

			let parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
				error: { type: "MISSING_MESSAGE" },
			});

			parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&message=hello+world&signature=22f8ef55e8120fbf51e2407c808a1cc98d7ef961646226a3d3fad606437f8ba49ab68dc33c6d4a478f954c72e9bac2b4a4fe48baa70121a311a875dba1527d9d",
			);

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
				error: { type: "MISSING_SIGNATORY" },
			});

			parameters = new URLSearchParams(
				"coin=ARK&network=ark.devnet&method=verify&message=hello+world&signatory=025f81956d5826bad7d30daed2b5c8c98e72046c1ec8323da336445476183fb7ca",
			);

			await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
				error: { type: "MISSING_SIGNATURE" },
			});
		});
	});

	it("should throw if sign and no message", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign",
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
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=test",
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
			`/profiles/${profile.id()}/sign-message?coin=ARK&nethash=${
				profile.wallets().first().network().meta().nethash
			}&method=sign&message=test`,
		);
	});

	it("should validate vote", async () => {
		const mockFindDelegateByName = vi
			.spyOn(env.delegates(), "findByUsername")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams(
			"coin=ARK&network=ark.devnet&method=vote&delegate=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();

		mockFindDelegateByName.mockRestore();
	});

	it("should find delegate by public key", async () => {
		const mockFindDelegateByPublicKey = vi
			.spyOn(env.delegates(), "findByPublicKey")
			.mockReturnValue(profile.wallets().first());

		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&publicKey=1");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toBeUndefined();

		mockFindDelegateByPublicKey.mockRestore();
	});

	it("should throw for invalid address if sign with invalid address", async () => {
		const parameters = new URLSearchParams(
			"coin=ARK&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&method=sign&message=hello&address=1",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "INVALID_ADDRESS_OR_NETWORK_MISMATCH" },
		});
	});

	it("should fail to find delegate by public key", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&publicKey=1");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "DELEGATE_NOT_FOUND", value: "1" },
		});
	});

	it("should not allow both delegate name and public keys in the url", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&publicKey=1&delegate=test");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "AMBIGUOUS_DELEGATE" },
		});
	});

	it("should fail to validate delegate address", async () => {
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote&delegate=custom");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "DELEGATE_NOT_FOUND", value: "custom" },
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
		const parameters = new URLSearchParams("coin=ARK&network=ark.devnet&method=vote");

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "MISSING_DELEGATE" },
		});
	});

	it("should fail if delegate is resigned", async () => {
		const delegateWallet = new ReadOnlyWallet({
			address: profile.wallets().first().address(),
			explorerLink: "",
			governanceIdentifier: "address",
			isDelegate: true,
			isResignedDelegate: false,
			publicKey: profile.wallets().first().publicKey(),
			rank: 52,
			username: "testi",
		});
		const mockFindDelegateByPublicKey = vi
			.spyOn(env.delegates(), "findByPublicKey")
			.mockReturnValue(delegateWallet);

		const resignedMock = vi.spyOn(delegateWallet, "isResignedDelegate").mockReturnValue(true);

		const parameters = new URLSearchParams(
			`coin=ARK&network=ark.devnet&method=vote&publicKey=${delegateWallet.publicKey()}`,
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: {
				type: "DELEGATE_RESIGNED",
				value: truncate(delegateWallet.publicKey(), { length: 20, omissionPosition: "middle" }),
			},
		});

		mockFindDelegateByPublicKey.mockRestore();
		resignedMock.mockRestore();
	});

	it("should generate send transfer path", () => {
		const parameters = new URLSearchParams(
			"coin=ark&method=transfer&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
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
			`/profiles/${profile.id()}/send-transfer?coin=ark&method=transfer&nethash=${
				profile.wallets().first().network().meta().nethash
			}`,
		);
	});

	it("should generate send vote path", () => {
		const parameters = new URLSearchParams(
			"coin=ark&method=vote&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867&delegate=test",
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
			`/profiles/${profile.id()}/send-vote?coin=ark&method=vote&nethash=${
				profile.wallets().first().network().meta().nethash
			}&delegate=test&vote=undefined`,
		);
	});

	it("should return error if no available wallets found in network (with network)", async () => {
		const mockAvailableWallets = vi.spyOn(profile.wallets(), "findByCoinWithNetwork").mockReturnValue([]);

		const parameters = new URLSearchParams(
			"amount=10&coin=ark&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: { type: "NETWORK_NO_WALLETS", value: "ARK Devnet" },
		});

		mockAvailableWallets.mockRestore();
	});

	it("should return error if no available wallets found in network (with nethash)", async () => {
		const mockAvailableWallets = vi.spyOn(profile.wallets(), "findByCoinWithNethash").mockReturnValue([]);

		const parameters = new URLSearchParams(
			"coin=ark&method=transfer&nethash=2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
		);

		const { result } = renderHook(() => useSearchParametersValidation());

		await expect(result.current.validateSearchParameters(profile, env, parameters)).resolves.toStrictEqual({
			error: {
				type: "NETWORK_NO_WALLETS",
				value: "ARK Devnet",
			},
		});

		mockAvailableWallets.mockRestore();
	});

	it("should build uri error message", () => {
		const { result } = renderHook(() => useSearchParametersValidation());

		expect(result.current.buildSearchParametersError({ type: "AMBIGUOUS_DELEGATE" })).toMatchInlineSnapshot(`
			<Trans
			  i18nKey="TRANSACTION.VALIDATION.DELEGATE_OR_PUBLICKEY"
			  parent={[Function]}
			/>
		`);
	});

	it("should build qr error message", () => {
		const { result } = renderHook(() => useSearchParametersValidation());

		expect(result.current.buildSearchParametersError({ coin: "custom", type: "COIN_NOT_SUPPORTED" }, true))
			.toMatchInlineSnapshot(`
				<Trans
				  i18nKey="TRANSACTION.VALIDATION.COIN_NOT_SUPPORTED"
				  parent={[Function]}
				  values={
				    {
				      "coin": undefined,
				    }
				  }
				/>
			`);
	});
});
