/// <reference types="vite-plugin-svgr/client" />

import { FC, SVGProps } from "react";

import { ArrowIcons } from "./arrows";
import Bell from "./bell.svg?react";
import Categories from "./categories.svg?react";
import Calendar from "./calendar.svg?react";
import ChartActiveDot from "./chart-active-dot.svg?react";
import Checkmark from "./check-mark.svg?react";
import CheckmarkDouble from "./double-checkmark.svg?react";
import CheckmarkDoubleCircle from "./double-checkmark-circle.svg?react";
import CheckmarkSmall from "./check-mark-small.svg?react";
import CircleCheckMark from "./circle-check-mark.svg?react";
import CircleCheckMarkPencil from "./circle-check-mark-pencil.svg?react";
import CircleCross from "./circle-cross.svg?react";
import CircleExclamationMark from "./circle-exclamation-mark.svg?react";
import CircleInfo from "./circle-info.svg?react";
import CircleQuestionMark from "./circle-question-mark.svg?react";
import CircleCompletedLight from "./circle-completed-light.svg?react";
import CircleCompletedLightGreen from "./circle-completed-light-green.svg?react";
import CircleCompletedDark from "./circle-completed-dark.svg?react";
import CircleCompletedDarkGreen from "./circle-completed-dark-green.svg?react";
import Clock from "./clock.svg?react";
import ClockError from "./clock-error.svg?react";
import ClockPencil from "./clock-pencil.svg?react";
import ClockSmall from "./clock-small.svg?react";
import Cloud from "./cloud.svg?react";
import Code from "./code.svg?react";
import Copy from "./copy.svg?react";
import CopyKey from "./copy-key.svg?react";
import Contract from "./contract.svg?react";
import CopySuccess from "./copy-success.svg?react";
import Cross from "./cross.svg?react";
import Download from "./download.svg?react";
import DoubleCheckedCircle from "./double-circle.svg?react";
import CrossSmall from "./cross-small.svg?react";
import { Currencies } from "./currencies";
import Dash from "./dash.svg?react";
import EllipsisVertical from "./ellipsis-vertical.svg?react";
import EllipsisVerticalFilled from "./ellipsis-vertical-filled.svg?react";
import ExtensionWweDark from "./extension-wwe-dark.svg?react";
import ExtensionWweLight from "./extension-wwe-light.svg?react";
import ExtensionJson from "./extension-json.svg?react";
import ExtensionCsv from "./extension-csv.svg?react";
import Eye from "./eye.svg?react";
import EyeSlash from "./eye-slash.svg?react";
import File from "./file.svg?react";
import FileLines from "./file-lines.svg?react";
import FrameKey from "./frame-key.svg?react";
import FTX from "./ftx.svg?react";
import Funnel from "./funnel.svg?react";
import Globe from "./globe.svg?react";
import GlobePointer from "./globe-pointer.svg?react";
import Grid from "./grid.svg?react";
import HintSmall from "./hint-small.svg?react";
import Ledger from "./ledger.svg?react";
import LedgerAlt from "./ledger-alt.svg?react";
import List from "./list.svg?react";
import LoaderLogo from "./loader-logo.svg?react";
import Lock from "./lock.svg?react";
import MagnifyingGlass from "./magnifying-glass.svg?react";
import MagnifyingGlassAlt from "./magnifying-glass-alt.svg?react";
import MagnifyingGlassId from "./magnifying-glass-id.svg?react";
import Menu from "./menu.svg?react";
import MenuOpen from "./menu-open.svg?react";
import MoneyCoinSwap from "./money-coin-swap.svg?react";
import NoteCheck from "./note-check.svg?react";
import Pencil from "./pencil.svg?react";
import PencilRuler from "./pencil-ruler.svg?react";
import Server from "./server.svg?react";
import ServerMultisign from "./server-multisign.svg?react";
import ServerPeer from "./server-peer.svg?react";
import Forbidden from "./forbidden.svg?react";
import Plus from "./plus.svg?react";
import QRCode from "./qr-code.svg?react";
import QuestionMarkSmall from "./question-mark-small.svg?react";
import ShieldCheckMark from "./shield-check-mark.svg?react";
import Sliders from "./sliders.svg?react";
import SlidersVertical from "./sliders-vertical.svg?react";
import Star from "./star.svg?react";
import StarFilled from "./star-filled.svg?react";
import StatusOk from "./status-ok.svg?react";
import StatusError from "./status-error.svg?react";
import StatusStandby from "./status-standby.svg?react";
import { TransactionIcons } from "./transactions";
import Trash from "./trash.svg?react";
import UnderlineMoon from "./underline-moon.svg?react";
import UnderlineSun from "./underline-sun.svg?react";
import User from "./user.svg?react";
import UserCheckMark from "./user-check-mark.svg?react";
import Dashboard from "./dashboard.svg?react";
import DocumentView from "./document-view.svg?react";
import ImportWalletLight from "./import-wallet-light.svg?react";
import ImportWalletLightGreen from "./import-wallet-light-green.svg?react";
import ImportWalletDark from "./import-wallet-dark.svg?react";
import ImportWalletDarkGreen from "./import-wallet-dark-green.svg?react";
import ImportProfileLight from "./import-profile-light.svg?react";
import ImportProfileLightGreen from "./import-profile-light-green.svg?react";
import ImportProfileDark from "./import-profile-dark.svg?react";
import ImportProfileDarkGreen from "./import-profile-dark-green.svg?react";
import SelectNetworkLightGreen from "./select-network-light-green.svg?react";
import SelectNetworkLight from "./select-network-light.svg?react";
import SelectNetworkDarkGreen from "./select-network-dark-green.svg?react";
import SelectNetworkDark from "./select-network-dark.svg?react";
import WalletEncryptionDark from "./wallet-encryption-dark.svg?react";
import WalletEncryptionDarkGreen from "./wallet-encryption-dark-green.svg?react";
import WalletEncryptionLight from "./wallet-encryption-light.svg?react";
import WalletEncryptionLightGreen from "./wallet-encryption-light-green.svg?react";
import Completed from "./completed.svg?react";
import YourPassphraseLight from "./your-passphrase-light.svg?react";
import YourPassphraseLightGreen from "./your-passphrase-light-green.svg?react";
import YourPassphraseDark from "./your-passphrase-dark.svg?react";
import YourPassphraseDarkGreen from "./your-passphrase-dark-green.svg?react";
import ConfirmYourPassphrase from "./confirm-your-passphrase.svg?react";
import PersonLight from "./person-light.svg?react";
import PersonDark from "./person-dark.svg?react";
import PersonDarkGreen from "./person-dark-green.svg?react";
import PersonLightGreen from "./person-light-green.svg?react";

export const SvgCollection: Record<string, FC<SVGProps<SVGSVGElement>>> = {
	...ArrowIcons,
	...Currencies,
	...TransactionIcons,
	Bell,
	Calendar,
	Categories,
	ChartActiveDot,
	Checkmark,
	CheckmarkDouble,
	CheckmarkDoubleCircle,
	CheckmarkSmall,
	CircleCheckMark,
	CircleCheckMarkPencil,
	CircleCompletedDark,
	CircleCompletedDarkGreen,
	CircleCompletedLight,
	CircleCompletedLightGreen,
	CircleCross,
	CircleExclamationMark,
	CircleInfo,
	CircleQuestionMark,
	Clock,
	ClockError,
	ClockPencil,
	ClockSmall,
	Cloud,
	Code,
	Completed,
	ConfirmYourPassphrase,
	Contract,
	Copy,
	CopyKey,
	CopySuccess,
	Cross,
	CrossSmall,
	Dash,
	Dashboard,
	Delegate: TransactionIcons.DelegateRegistration,
	DocumentView,
	DoubleCheckedCircle,
	Download,
	EllipsisVertical,
	EllipsisVerticalFilled,
	ExtensionCsv,
	ExtensionJson,
	ExtensionWweDark,
	ExtensionWweLight,
	Eye,
	EyeSlash,
	FTX,
	File,
	FileLines,
	Forbidden,
	FrameKey,
	Funnel,
	Globe,
	GlobePointer,
	Grid,
	HintSmall,
	ImportProfileDark,
	ImportProfileDarkGreen,
	ImportProfileLight,
	ImportProfileLightGreen,
	ImportWalletDark,
	ImportWalletDarkGreen,
	ImportWalletLight,
	ImportWalletLightGreen,
	Ledger,
	LedgerAlt,
	List,
	LoaderLogo,
	Lock,
	LockOpen: TransactionIcons.UnlockToken,
	MagnifyingGlass,
	MagnifyingGlassAlt,
	MagnifyingGlassId,
	Menu,
	MenuOpen,
	MoneyCoinSwap,
	NoteCheck,
	Pencil,
	PencilRuler,
	PersonDark,
	PersonDarkGreen,
	PersonLight,
	PersonLightGreen,
	Plus,
	QRCode,
	QuestionMarkSmall,
	SelectNetworkDark,
	SelectNetworkDarkGreen,
	SelectNetworkLight,
	SelectNetworkLightGreen,
	Server,
	ServerMultisign,
	ServerPeer,
	ShieldCheckMark,
	Sliders,
	SlidersVertical,
	Star,
	StarFilled,
	StatusError,
	StatusOk,
	StatusStandby,
	Trash,
	UnderlineMoon,
	UnderlineSun,
	User,
	UserCheckMark,
	WalletEncryptionDark,
	WalletEncryptionDarkGreen,
	WalletEncryptionLight,
	WalletEncryptionLightGreen,
	YourPassphraseDark,
	YourPassphraseDarkGreen,
	YourPassphraseLight,
	YourPassphraseLightGreen,
};
