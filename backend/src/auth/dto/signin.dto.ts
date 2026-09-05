import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SigninDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
