import { IsDefined, IsUUID } from "class-validator";

export class RegistrationAnswerDto {
  @IsUUID()
  fieldId!: string;

  @IsDefined()
  value!: string | string[];
}
