import { translations as transactionTranslations } from "@/domains/transaction/i18n";
import { render, screen } from "@/utils/testing-library";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { QrModal } from "./QrModal";

jest.mock("react-qr-reader", () => ({
  QrReader: jest.fn().mockImplementation(
    ({ onResult }: { onResult: (result: any) => void }) => {
      if (onResult) {
        onResult({});
      }

      return null;
    },
  ),
}));

const reactQrReaderMock = require("react-qr-reader");

describe("QrModal", () => {
  it("should render", () => {
    const { asFragment } = render(
      <QrModal
        isOpen={true}
        onCancel={jest.fn()}
        onRead={jest.fn()}
      />
    );

    expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.TITLE)).toBeInTheDocument()
    expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.DESCRIPTION)).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  })

  it("should execute onCancel callback", () => {
    const onCancel = jest.fn();

    render(
      <QrModal
        isOpen={true}
        onCancel={onCancel}
        onRead={jest.fn()}
      />
    );

    const closeButton = screen.getByTestId("Modal__close-button");

		userEvent.click(closeButton);

		expect(onCancel).toHaveBeenCalledWith();
  });

  it("should render permission denied error", async () => {
    reactQrReaderMock.QrReader.mockImplementation(
      ({ onResult }: { onResult: (result: any, error?: Error | null) => void }) => {
        if (onResult) {
          onResult(undefined, new Error("Permission denied"));
        }

        return null;
      },
    );

    render(
      <QrModal
        isOpen={true}
        onCancel={jest.fn()}
        onRead={jest.fn()}
      />
    );

    await waitFor(() => expect(screen.getByText("error-small.svg")).toBeInTheDocument());

    expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.PERMISSION_ERROR.TITLE)).toBeInTheDocument();
    expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.PERMISSION_ERROR.DESCRIPTION)).toBeInTheDocument();
  });

  it("should render other error", async () => {
    reactQrReaderMock.QrReader.mockImplementation(
      ({ onResult }: { onResult: (result: any, error?: Error | null) => void }) => {
        if (onResult) {
          onResult(undefined, new Error("other error"));
        }

        return null;
      },
    );

    render(
      <QrModal
        isOpen={true}
        onCancel={jest.fn()}
        onRead={jest.fn()}
      />
    );

    await waitFor(() => expect(screen.getByText("error-small.svg")).toBeInTheDocument());

    expect(screen.getByText(transactionTranslations.MODAL_QR_CODE.ERROR)).toBeInTheDocument();
  });
});
