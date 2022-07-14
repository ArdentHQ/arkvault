import { Modal } from "@/app/components/Modal";
import { QRCameraReader } from "@/app/components/QRCameraReader";
import React from "react";

interface QrModalProperties {
	isOpen: boolean;
	onCancel: () => void;
}

export const QrModal = ({ isOpen, onCancel }: QrModalProperties) => (
  <Modal isOpen={isOpen} title="QR" size="lg" onClose={() => onCancel()}>
    <QRCameraReader />
  </Modal>
);
