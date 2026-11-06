export * from "./SimpleDropdown";
export * from "./SimpleDropdown.blocks";

// Re-export types for consumers migrating from the old Dropdown component
export type {
	DropdownOption,
	DropdownOptionGroup,
	OptionsProperties,
	DropdownVariantType,
	DropdownProperties,
} from "@/app/components/Dropdown/Dropdown.contracts";
