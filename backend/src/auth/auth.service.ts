import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { SigninDto } from "./dto/signin.dto";
import { usersTable } from "../db/schema";
import { db } from "../db";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signin(signinDto: SigninDto) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, signinDto.username))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: user.id,
      username: user.username,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
let test = "$2b$10$dbTNwU69/1awjH5vikE7o.1v860cTiiygYwXdar/BNmX..RJorpge";
console.log(test);