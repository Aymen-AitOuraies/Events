import { Body, Controller, Post, Get } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SigninDto } from "./dto/signin.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard/jwt-auth.guard";
import { UseGuards } from "@nestjs/common";
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signin")
  signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("test")
  test() {
    return true;
  }
}
