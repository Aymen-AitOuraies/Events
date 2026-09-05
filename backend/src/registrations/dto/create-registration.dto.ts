import { IsArray, IsDefined, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

import { RegistrationAnswerDto } from "./registration-answer.dto";

export class CreateRegistrationDto {
  @IsArray()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => RegistrationAnswerDto)
  answers!: RegistrationAnswerDto[];
}
