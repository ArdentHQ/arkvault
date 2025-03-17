import React from "react";
import { WalletEncryptionBanner } from "./WalletEncryptionBanner";
import { OptionsValue } from "@/domains/wallet/hooks/use-import-options";
import {
	render,
	screen,
} from "@/utils/testing-library";
import { vi } from "vitest";

describe("WalletEncryptionBanner", () => {
    it("should render", () => {
        render(<WalletEncryptionBanner toggleOnChange={vi.fn()} toggleChecked={false} checkboxChecked={false} checkboxOnChange={vi.fn()} />);

        expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).toBeInTheDocument();
    });

    it("should disable the toggle when the import option is not available", () => {
        render(<WalletEncryptionBanner toggleOnChange={vi.fn()} toggleChecked={false} checkboxChecked={false} checkboxOnChange={vi.fn()} importOption={{ value: OptionsValue.LEDGER, canBeEncrypted: false }} />);

        expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).toBeDisabled();
    });

    it("should disable the toggle when the import option is available but the wallet cannot be encrypted", () => {
        render(<WalletEncryptionBanner toggleOnChange={vi.fn()} toggleChecked={false} checkboxChecked={false} checkboxOnChange={vi.fn()} importOption={{ value: OptionsValue.LEDGER, canBeEncrypted: false }} />);

        expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).toBeDisabled();
    });
    
    it("should enable the toggle when the import option is available and the wallet can be encrypted", () => {
        render(<WalletEncryptionBanner toggleOnChange={vi.fn()} toggleChecked={false} checkboxChecked={false} checkboxOnChange={vi.fn()} importOption={{ value: OptionsValue.LEDGER, canBeEncrypted: true }} />);

        expect(screen.getByTestId("WalletEncryptionBanner__encryption-toggle")).toBeEnabled();
    });
    
    
    
});