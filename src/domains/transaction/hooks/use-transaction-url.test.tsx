import { renderHook } from "@testing-library/react";

import { useTransactionURL } from "./use-transaction-url";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const prefix = "http://localhost:3000/#/";
const searchParameters =
	"amount=10&coin=ARK&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

describe("useTransactionURL", () => {
	it("should generate send transfer path", () => {
		const { result } = renderHook(() => useTransactionURL());
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(result.current.generateSendTransferPath(profile, `${prefix}?${searchParameters}`)).toBe(
			`/profiles/${profile.id()}/send-transfer?${searchParameters}`,
		);
	});
});
