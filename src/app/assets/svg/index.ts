/// <reference types="vite-plugin-svgr/client" />

import { FC, SVGProps } from "react";

import { ArrowIcons } from "./arrows";
import Bell from "./bell.svg?react";
import Categories from "./categories.svg?react";
import Calendar from "./calendar.svg?react";
import ChartActiveDot from "./chart-active-dot.svg?react";
import Checkmark from "./check-mark.svg?react";
import CheckmarkSmall from "./check-mark-small.svg?react";
import CircleCheckMark from "./circle-check-mark.svg?react";
import CircleCheckMarkPencil from "./circle-check-mark-pencil.svg?react";
import CircleCross from "./circle-cross.svg?react";
import CircleExclamationMark from "./circle-exclamation-mark.svg?react";
import CircleInfo from "./circle-info.svg?react";
import CircleQuestionMark from "./circle-question-mark.svg?react";
import Clock from "./clock.svg?react";
import ClockError from "./clock-error.svg?react";
import ClockPencil from "./clock-pencil.svg?react";
import ClockSmall from "./clock-small.svg?react";
import Cloud from "./cloud.svg?react";
import Code from "./code.svg?react";
import Copy from "./copy.svg?react";
import CopyKey from "./copy-key.svg?react";
import Cross from "./cross.svg?react";
import Download from "./download.svg?react";
import CrossSmall from "./cross-small.svg?react";
import { Currencies } from "./currencies";
import Dash from "./dash.svg?react";
import EllipsisVertical from "./ellipsis-vertical.svg?react";
import ExtensionWwe from "./extension-wwe.svg?react";
import ExtensionJson from "./extension-json.svg?react";
import ExtensionCsv from "./extension-csv.svg?react";
import Eye from "./eye.svg?react";
import EyeSlash from "./eye-slash.svg?react";
import File from "./file.svg?react";
import FileLines from "./file-lines.svg?react";
import FrameKey from "./frame-key.svg?react";
import FTX from "./ftx.svg?react";
import Globe from "./globe.svg?react";
import GlobePointer from "./globe-pointer.svg?react";
import Grid from "./grid.svg?react";
import HintSmall from "./hint-small.svg?react";
import Ledger from "./ledger.svg?react";
import List from "./list.svg?react";
import LoaderLogo from "./loader-logo.svg?react";
import Lock from "./lock.svg?react";
import MagnifyingGlass from "./magnifying-glass.svg?react";
import MagnifyingGlassId from "./magnifying-glass-id.svg?react";
import Menu from "./menu.svg?react";
import MenuOpen from "./menu-open.svg?react";
import MoneyCoinSwap from "./money-coin-swap.svg?react";
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
import ImportWalletDark from "./import-wallet-dark.svg?react";
import SelectNetworkLight from "./select-network-light.svg?react";
import SelectNetworkDark from "./select-network-dark.svg?react";
import WalletEncryptionDark from "./wallet-encryption-dark.svg?react";
import WalletEncryptionLight from "./wallet-encryption-light.svg?react";
import Completed from "./completed.svg?react";

export const SvgCollection: Record<string, FC<SVGProps<SVGSVGElement>>> = {
	...ArrowIcons,
	...Currencies,
	...TransactionIcons,
	Bell,
	Calendar,
	Categories,
	ChartActiveDot,
	Checkmark,
	CheckmarkSmall,
	CircleCheckMark,
	CircleCheckMarkPencil,
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
	Copy,
	CopyKey,
	Cross,
	CrossSmall,
	Dash,
	Dashboard,
	Delegate: TransactionIcons.DelegateRegistration,
	DocumentView,
	Download,
	EllipsisVertical,
	ExtensionCsv,
	ExtensionJson,
	ExtensionWwe,
	Eye,
	EyeSlash,
	FTX,
	File,
	FileLines,
	Forbidden,
	FrameKey,
	Globe,
	GlobePointer,
	Grid,
	HintSmall,
	ImportWalletDark,
	ImportWalletLight,
	Ledger,
	List,
	LoaderLogo,
	Lock,
	LockOpen: TransactionIcons.UnlockToken,
	MagnifyingGlass,
	MagnifyingGlassId,
	Menu,
	MenuOpen,
	MoneyCoinSwap,
	Pencil,
	PencilRuler,
	Plus,
	QRCode,
	QuestionMarkSmall,
	SelectNetworkDark,
	SelectNetworkLight,
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
	WalletEncryptionLight,
};
