import { Modal } from "@/app/components/Modal";
import { QRCameraReader } from "@/app/components/QRCameraReader";

interface QrModalProperties {
	isOpen: boolean;
	onCancel: () => void;
}

export const QrModal = ({ isOpen, onCancel }: QrModalProperties) => {
	return (
		<Modal isOpen={isOpen} title="QR" size="lg" onClose={() => onCancel()}>
			<QRCameraReader />
		</Modal>
	);
};
