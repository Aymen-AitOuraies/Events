import { IsNotEmpty, IsString } from "class-validator";

export class CheckInRegistrationDto {
  @IsString()
  @IsNotEmpty()
  qrToken!: string;
}
