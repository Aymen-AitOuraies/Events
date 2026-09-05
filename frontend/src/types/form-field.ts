export const formFieldTypes = [
  "TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
] as const;
export type FormFieldType = (typeof formFieldTypes)[number];

export type FormField = {
  id: string;
  eventId: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options: string[] | null;
  position: number;
};

export type FormFieldDraft = Omit<FormField, "id" | "eventId"> & {
  id?: string;
};

export const optionFieldTypes: FormFieldType[] = [
  "SELECT",
  "RADIO",
  "CHECKBOX",
];
