import {
  IsDateString,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor1?: string;

  @IsOptional()
  @IsHexColor()
  backgroundColor2?: string;

  @IsOptional()
  registrationOpen?: boolean;
}
