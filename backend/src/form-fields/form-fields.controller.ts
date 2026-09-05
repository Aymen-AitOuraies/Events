import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard/jwt-auth.guard";
import { CreateFormFieldDto } from "./dto/create-form-field.dto";
import { UpdateFormFieldDto } from "./dto/update-form-field.dto";
import { FormFieldsService } from "./form-fields.service";

@Controller("events/:eventId/form-fields")
@UseGuards(JwtAuthGuard)
export class FormFieldsController {
  constructor(private readonly formFieldsService: FormFieldsService) {}

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() createFormFieldDto: CreateFormFieldDto,
  ) {
    return this.formFieldsService.create(eventId, createFormFieldDto);
  }

  @Get()
  findAll(@Param("eventId") eventId: string) {
    return this.formFieldsService.findAll(eventId);
  }

  @Get(":id")
  findOne(@Param("eventId") eventId: string, @Param("id") id: string) {
    return this.formFieldsService.findOne(eventId, id);
  }

  @Patch(":id")
  update(
    @Param("eventId") eventId: string,
    @Param("id") id: string,
    @Body() updateFormFieldDto: UpdateFormFieldDto,
  ) {
    return this.formFieldsService.update(eventId, id, updateFormFieldDto);
  }

  @Delete(":id")
  remove(@Param("eventId") eventId: string, @Param("id") id: string) {
    return this.formFieldsService.remove(eventId, id);
  }
}
