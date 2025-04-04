import React from "react";

import { DeleteWallet } from "./DeleteWallet";
import { translations } from "@/domains/wallet/i18n";
import { render, screen, env, getMainsailProfileId } from "@/utils/testing-library";

const onDelete = vi.fn();

describe("DeleteWallet", () => {
	it("should render a modal", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const wallet = await profile.walletFactory().fromAddress({
			address: "0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
			coin: "Mainsail",
			network: "mainsail.mainnet",
		});

		const { asFragment } = render(<DeleteWallet isOpen={true} onDelete={onDelete} wallet={wallet} />);

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_WALLET.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.MODAL_DELETE_WALLET.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});
});
