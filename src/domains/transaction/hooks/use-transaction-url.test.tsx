import { renderHook } from "@testing-library/react-hooks";

import { useTransactionURL } from "./use-transaction-url";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const prefix = "http://localhost:3000";
const searchParameters =
	"amount=10&coin=ARK&method=transfer&network=ark.devnet&recipient=DNSBvFTJtQpS4hJfLerEjSXDrBT7K6HL2o";

describe("useTransactionURL", () => {
	it.each(["/", "", "/#/"])("should generate send transfer path", (suffix) => {
		const { result } = renderHook(() => useTransactionURL());
		const profile = env.profiles().findById(getDefaultProfileId());

		expect(result.current.generateSendTransferPath(profile, `${prefix}${suffix}?${searchParameters}`)).toEqual(
			`/profiles/${profile.id()}/send-transfer?${searchParameters}`,
		);
	});
});
