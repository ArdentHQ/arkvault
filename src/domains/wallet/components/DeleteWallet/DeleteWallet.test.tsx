import React from "react";

import { translations } from "@/domains/wallet/i18n";
import { env, getDefaultProfileId, render, screen } from "@/utils/testing-library";

import { DeleteWallet } from "./DeleteWallet";

const onDelete = vi.fn();

describe("DeleteWallet", () => {
	it("should render a modal", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		const wallet = await profile.walletFactory().fromAddress({
			address: "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
			coin: "ARK",
			network: "ark.mainnet",
		});

		const { asFragment } = render(<DeleteWallet isOpen={true} onDelete={onDelete} wallet={wallet} />);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_WALLET.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_WALLET.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});
});
