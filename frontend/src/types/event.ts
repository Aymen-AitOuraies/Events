export type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
  imageUrl?: string | null;
  backgroundColor1?: string | null;
  backgroundColor2?: string | null;
  registrationOpen?: boolean;
};

export type EventForm = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  backgroundColor1: string;
  backgroundColor2: string;
};

export const emptyEventForm: EventForm = {
  title: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
  imageUrl: "",
  backgroundColor1: "#083344",
  backgroundColor2: "#06b6d4",
};
