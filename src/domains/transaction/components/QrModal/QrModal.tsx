import { Alert } from "@/app/components/Alert";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";
import { Image } from "@/app/components/Image";
import { Modal } from "@/app/components/Modal";
import { QRCameraReader } from "@/app/components/QRCameraReader";
import { Spinner } from "@/app/components/Spinner";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface QrModalProperties {
	isOpen: boolean;
	onCancel: () => void;
	onRead: (text: string) => void;
}

const ViewFinder = ({ hasError, isLoading }: { hasError: boolean, isLoading: boolean }) => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="ViewFinder"
      className="flex flex-col items-center justify-center relative border-2 border-theme-secondary-500 w-[300px] h-[300px] z-10"
      style={{ boxShadow: "0px 0px 0px 9999px rgba(0, 0, 0, 0.75)" }}
    >
      <div className="absolute left-8 right-8 -top-[2px] h-0.5 bg-theme-secondary-800" />
      <div className="absolute left-8 right-8 -bottom-[2px] h-0.5 bg-theme-secondary-800" />
      <div className="absolute top-8 bottom-8 -left-[2px] w-0.5 bg-theme-secondary-800" />
      <div className="absolute top-8 bottom-8 -right-[2px] w-0.5 bg-theme-secondary-800" />

      {isLoading && (
        <>
          <div className="absolute inset-0 -z-10" style={{ boxShadow: "inset 9999px 0px 0px rgba(0, 0, 0, 0.75)" }} />

          <Spinner size="xl" theme="dark" />
        </>
      )}

      {hasError && (
        <>
          <div className="absolute inset-0 -z-10" style={{ boxShadow: "inset 9999px 0px 0px rgba(0, 0, 0, 0.75)" }} />

          <Image className="w-22" name="ErrorSmall" useAccentColor={false} />

          <Alert title={t("TRANSACTION.MODAL_QR_CODE.PERMISSION_ERROR.TITLE")} variant="danger" className="mx-5 mt-8">{t("TRANSACTION.MODAL_QR_CODE.PERMISSION_ERROR.DESCRIPTION")}</Alert>
        </>
      )}
    </div>
  );
};

export const QrModal = ({ isOpen, onCancel, onRead }: QrModalProperties) => {
  const [showAccessDeniedError, setShowAccessDeniedError] = useState(false);
  const [ready, setReady] = useState(false);

  const { t } = useTranslation();

  const handleAccessDenied = () => {
    setShowAccessDeniedError(true);
  };

  const handleError = (error: Error) => {
    console.log("error", error);
  };

  const handleReady = () => {
    if (!ready) {
      setReady(true);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setShowAccessDeniedError(false);
      setReady(false);
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      title={t("TRANSACTION.MODAL_QR_CODE.TITLE")}
      description={t("TRANSACTION.MODAL_QR_CODE.DESCRIPTION")}
      size="4xl"
      noButtons
      onClose={() => onCancel()}
    >
      <div className="relative overflow-hidden flex justify-center -mx-10 -mb-10 mt-8" style={{
        backgroundImage: "url('/qr-background.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}>
        <div className="absolute inset-0 z-10">
          <QRCameraReader
            onCameraAccessDenied={handleAccessDenied}
            onError={handleError}
            onRead={onRead}
            onReady={handleReady}
          />
        </div>

        <div className="flex flex-col justify-center items-center space-y-8 py-8 h-full">
          <ViewFinder hasError={showAccessDeniedError} isLoading={!ready} />

          <Button variant="secondary" theme="dark" className="z-20 space-x-2">
            <Icon name="ArrowUpBracket" />
            <span>{t("TRANSACTION.MODAL_QR_CODE.UPLOAD")}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};
