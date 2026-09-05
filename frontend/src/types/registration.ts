export type Registration = {
  id: string;
  eventId: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  createdAt: string;
};

export type RegistrationDetails = Registration & {
  answers: { fieldId: string; value: string }[];
};
