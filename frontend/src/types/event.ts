export type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: string;
  endDate: string;
};

export type EventForm = {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
};

export const emptyEventForm: EventForm = {
  title: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
};
