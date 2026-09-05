import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";

import { RegistrationsService } from "./registrations.service";

import { CreateRegistrationDto } from "./dto/create-registration.dto";
import { CheckInRegistrationDto } from "./dto/check-in-registration.dto";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard/jwt-auth.guard";

@Controller("events/:eventId/registrations")
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  /*
   * PUBLIC
   *
   * Participants submit the registration form.
   */
  @Post()
  create(
    @Param("eventId", new ParseUUIDPipe())
    eventId: string,

    @Body()
    dto: CreateRegistrationDto,
  ) {
    return this.registrationsService.create(eventId, dto);
  }

  /*
   * ADMIN / STAFF
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Param("eventId", new ParseUUIDPipe())
    eventId: string,
  ) {
    return this.registrationsService.findAll(eventId);
  }

  /*
   * ADMIN / STAFF
   */
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(
    @Param("eventId", new ParseUUIDPipe())
    eventId: string,

    @Param("id", new ParseUUIDPipe())
    registrationId: string,
  ) {
    return this.registrationsService.findOne(eventId, registrationId);
  }

  /*
   * ADMIN / STAFF
   */
  @UseGuards(JwtAuthGuard)
  @Post("check-in")
  checkIn(
    @Param("eventId", new ParseUUIDPipe())
    eventId: string,

    @Body()
    dto: CheckInRegistrationDto,

    @Req()
    req: { user: { id: string } },
  ) {
    return this.registrationsService.checkInByQrToken(
      eventId,
      dto.qrToken,
      req.user.id,
    );
  }

  /*
   * ADMIN / STAFF
   */
  @UseGuards(JwtAuthGuard)
  @Post(":id/cancel-check-in")
  cancelCheckIn(
    @Param("eventId", new ParseUUIDPipe())
    eventId: string,

    @Param("id", new ParseUUIDPipe())
    registrationId: string,
  ) {
    return this.registrationsService.cancelCheckIn(eventId, registrationId);
  }

  /*
   * ADMIN / STAFF
   */
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(
    @Param("eventId", new ParseUUIDPipe())
    eventId: string,

    @Param("id", new ParseUUIDPipe())
    registrationId: string,
  ) {
    return this.registrationsService.remove(eventId, registrationId);
  }
}
