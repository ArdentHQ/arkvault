import { renderHook } from "@testing-library/react";
import { useTransactionURL } from "./use-transaction-url";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const prefix = "http://localhost:3000/#/";
const searchParameters =
	"amount=10&coin=Mainsail&network=mainsail.devnet&recipient=0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1";

describe("useTransactionURL", () => {
	it("should generate send transfer path", () => {
		const { result } = renderHook(() => useTransactionURL());
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(result.current.generateSendTransferPath(profile, `${prefix}?${searchParameters}`)).toBe(
			`/profiles/${profile.id()}/dashboard?method=transfer&${searchParameters}`,
		);
	});

	it("should return URL search parameters", () => {
		const { result } = renderHook(() => useTransactionURL());

		const url = `${prefix}?${searchParameters}`;
		const parameters = result.current.urlSearchParameters(url);

		expect(parameters.get("amount")).toBe("10");
		expect(parameters.get("coin")).toBe("Mainsail");
		expect(parameters.get("recipient")).toBe("0x535B3D7A252fa034Ed71F0C53ec0C6F784cB64E1");
	});
});
