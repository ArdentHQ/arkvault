import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { ListenLedger } from "./ListenLedger";
import { LedgerProvider } from "@/app/contexts/Ledger/Ledger";
import {
	env,
	mockNanoSTransport,
	mockLedgerTransportError,
	getDefaultProfileId,
	render,
	waitFor,
} from "@/utils/testing-library";

describe("ListenLedger", () => {
	let profile: Contracts.IProfile;

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	const Component = ({
		onDeviceNotAvailable = vi.fn(),
		onDeviceAvailable = vi.fn(),
		transport = mockNanoSTransport(),
	}) => (
		<LedgerProvider transport={transport}>
			<ListenLedger onDeviceNotAvailable={onDeviceNotAvailable} onDeviceAvailable={onDeviceAvailable} />
		</LedgerProvider>
	);

	it("should emit event on device available", async () => {
		const onDeviceAvailable = vi.fn();

		const { container } = render(<Component onDeviceAvailable={onDeviceAvailable} />);

		await waitFor(() => expect(onDeviceAvailable).toHaveBeenCalledWith());

		expect(container).toMatchSnapshot();
	});

	it("should emit event on device not available", async () => {
		const onDeviceNotAvailable = vi.fn();

		const { container } = render(
			<Component
				onDeviceNotAvailable={onDeviceNotAvailable}
				transport={mockLedgerTransportError("Access denied to use Ledger device")}
			/>,
		);

		await waitFor(() => expect(onDeviceNotAvailable).toHaveBeenCalledWith());

		expect(container).toMatchSnapshot();
	});
});
