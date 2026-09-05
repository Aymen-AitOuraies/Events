import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { eventsTable, formFieldsTable } from "../db/schema";
import { CreateFormFieldDto } from "./dto/create-form-field.dto";
import { UpdateFormFieldDto } from "./dto/update-form-field.dto";

const validTypes = [
  "TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
] as const;

type FormFieldType = (typeof validTypes)[number];

@Injectable()
export class FormFieldsService {
  private validateType(type: string): asserts type is FormFieldType {
    if (!validTypes.includes(type as FormFieldType)) {
      throw new BadRequestException("Invalid form field type");
    }
  }

  private validateOptions(type: string, options?: string[]) {
    const choiceTypes = ["SELECT", "RADIO", "CHECKBOX"];

    if (choiceTypes.includes(type) && (!options || options.length === 0)) {
      throw new BadRequestException(
        "Options are required for SELECT, RADIO, and CHECKBOX fields",
      );
    }

    if (!choiceTypes.includes(type) && options && options.length > 0) {
      throw new BadRequestException(
        "Options are only allowed for SELECT, RADIO, and CHECKBOX fields",
      );
    }
  }

  private async validateEvent(eventId: string) {
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException("Event not found");
    }
  }

  async create(eventId: string, createFormFieldDto: CreateFormFieldDto) {
    await this.validateEvent(eventId);

    this.validateType(createFormFieldDto.type);

    this.validateOptions(createFormFieldDto.type, createFormFieldDto.options);

    const [formField] = await db
      .insert(formFieldsTable)
      .values({
        eventId,
        label: createFormFieldDto.label,
        type: createFormFieldDto.type,
        required: createFormFieldDto.required ?? false,
        options: createFormFieldDto.options,
        position: createFormFieldDto.position,
      })
      .returning();

    return formField;
  }

  async findAll(eventId: string) {
    await this.validateEvent(eventId);

    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.eventId, eventId));
  }

  async findOne(eventId: string, id: string) {
    const [formField] = await db
      .select()
      .from(formFieldsTable)
      .where(
        and(eq(formFieldsTable.id, id), eq(formFieldsTable.eventId, eventId)),
      )
      .limit(1);

    if (!formField) {
      throw new NotFoundException("Form field not found");
    }

    return formField;
  }

  async update(
    eventId: string,
    id: string,
    updateFormFieldDto: UpdateFormFieldDto,
  ) {
    const existingField = await this.findOne(eventId, id);

    const type = updateFormFieldDto.type ?? existingField.type;

    const options =
      updateFormFieldDto.options !== undefined
        ? updateFormFieldDto.options
        : existingField.options;

    this.validateType(type);
    this.validateOptions(type, options as string[] | undefined);

    const [formField] = await db
      .update(formFieldsTable)
      .set({
        ...updateFormFieldDto,
        type: type,
        options,
      })
      .where(
        and(eq(formFieldsTable.id, id), eq(formFieldsTable.eventId, eventId)),
      )
      .returning();

    return formField;
  }

  async remove(eventId: string, id: string) {
    await this.findOne(eventId, id);

    await db
      .delete(formFieldsTable)
      .where(
        and(eq(formFieldsTable.id, id), eq(formFieldsTable.eventId, eventId)),
      );

    return {
      message: "Form field deleted successfully",
    };
  }
}
