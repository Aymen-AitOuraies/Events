import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { and, eq } from "drizzle-orm";

import { db } from "../db";

import { eventsTable } from "../db/schema";
import { formFieldsTable } from "../db/schema";

import { registrationsTable } from "../db/schema";
import { registrationAnswersTable } from "../db/schema";

import { CreateRegistrationDto } from "./dto/create-registration.dto";
import { MailService } from "../mail/mail.service";

@Injectable()
export class RegistrationsService {
  constructor(private readonly mailService: MailService) {}

  async create(eventId: string, dto: CreateRegistrationDto) {
    /*
     * 1. Check that the event exists
     */
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    if (!event.registrationOpen) {
      throw new BadRequestException("Registration is closed for this event");
    }

    /*
     * 2. Get all fields belonging to this event
     */
    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.eventId, eventId));

    /*
     * 3. Create a map for quick lookup
     */
    const fieldMap = new Map(fields.map((field) => [field.id, field]));

    /*
     * 4. Prevent duplicate field IDs
     */
    const submittedFieldIds = new Set<string>();

    for (const answer of dto.answers) {
      if (submittedFieldIds.has(answer.fieldId)) {
        throw new BadRequestException(
          `Duplicate answer for field ${answer.fieldId}`,
        );
      }

      submittedFieldIds.add(answer.fieldId);
    }

    /*
     * 5. Make sure every submitted field
     *    belongs to this event
     */
    for (const answer of dto.answers) {
      if (!fieldMap.has(answer.fieldId)) {
        throw new BadRequestException(
          `Field ${answer.fieldId} does not belong to this event`,
        );
      }
    }

    /*
     * 6. Check required fields
     */
    /*
     * 7. Validate each answer according
     *    to its field type
     */
    for (const answer of dto.answers) {
      const field = fieldMap.get(answer.fieldId);

      if (!field) {
        throw new BadRequestException("Invalid form field");
      }

      this.validateAnswer(field, answer.value);
    }

    /*
     * 8. Find the EMAIL field
     *
     * We don't need a "key".
     * Your existing EMAIL type is enough.
     */
    const emailField = fields.find((field) => field.type === "EMAIL");
    if (!emailField) {
      throw new BadRequestException("This event must have an email field");
    }

    const emailAnswer = emailField
      ? dto.answers.find((answer) => answer.fieldId === emailField.id)
      : undefined;
    const email =
      emailAnswer && typeof emailAnswer.value === "string"
        ? emailAnswer.value.trim().toLowerCase()
        : undefined;

    if (!email) {
      throw new BadRequestException("A valid email address is required");
    }

    /*
     * 10. Prevent duplicate registration
     */
    if (emailField && email) {
      const existingRegistration = await db
        .select({ registrationId: registrationAnswersTable.registrationId })
        .from(registrationAnswersTable)
        .innerJoin(
          registrationsTable,
          eq(registrationAnswersTable.registrationId, registrationsTable.id),
        )
        .where(
          and(
            eq(registrationsTable.eventId, eventId),
            eq(registrationAnswersTable.fieldId, emailField.id),
            eq(registrationAnswersTable.value, email),
          ),
        )
        .limit(1);

      if (existingRegistration.length > 0) {
        throw new ConflictException(
          "This email is already registered for this event",
        );
      }
    }

    /*
     * 11. Generate secure QR token
     */
    const qrToken = randomBytes(32).toString("hex");

    /*
     * 12. Create registration + answers
     *     in ONE transaction
     */
    const registration = await db.transaction(async (tx) => {
      const [newRegistration] = await tx
        .insert(registrationsTable)
        .values({
          eventId,
          qrToken,
        })
        .returning();

      await tx.insert(registrationAnswersTable).values(
        dto.answers.map((answer) => ({
          registrationId: newRegistration.id,

          fieldId: answer.fieldId,

          value: Array.isArray(answer.value)
            ? JSON.stringify(answer.value)
            : String(answer.value),
        })),
      );

      return newRegistration;
    });

    /*
     * 13. Send confirmation email
     *     AFTER the DB transaction succeeds
     */
    if (email) {
      const nameField = fields.find(
        (field) => field.label.toLowerCase() === "full name",
      );
      const nameAnswer = nameField
        ? dto.answers.find((answer) => answer.fieldId === nameField.id)
        : undefined;
      const name =
        nameAnswer && typeof nameAnswer.value === "string"
          ? nameAnswer.value.trim()
          : "there";
      await this.mailService.sendRegistrationConfirmation(
        email,
        name,
        event.title,
        qrToken,
      );
    }

    /*
     * 14. Don't expose QR token
     */
    return {
      id: registration.id,
      eventId: registration.eventId,
      checkedIn: registration.checkedIn,
      createdAt: registration.createdAt,
    };
  }

  private validateAnswer(
    field: typeof formFieldsTable.$inferSelect,
    value: string | string[],
  ): void {
    switch (field.type) {
      case "TEXT":
        if (typeof value !== "string") {
          throw new BadRequestException(`"${field.label}" must be text`);
        }
        break;

      case "EMAIL":
        if (typeof value !== "string") {
          throw new BadRequestException(
            `"${field.label}" must be a valid email`,
          );
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new BadRequestException(
            `"${field.label}" must be a valid email`,
          );
        }
        break;

      case "PHONE":
        if (typeof value !== "string") {
          throw new BadRequestException(
            `"${field.label}" must be a phone number`,
          );
        }
        break;

      case "NUMBER":
        if (typeof value !== "string" || Number.isNaN(Number(value))) {
          throw new BadRequestException(`"${field.label}" must be a number`);
        }
        break;

      case "DATE":
        if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
          throw new BadRequestException(
            `"${field.label}" must be a valid date`,
          );
        }
        break;

      case "SELECT":
      case "RADIO":
        if (typeof value !== "string") {
          throw new BadRequestException(
            `"${field.label}" must contain one value`,
          );
        }

        if (!field.options?.includes(value)) {
          throw new BadRequestException(`Invalid value for "${field.label}"`);
        }
        break;

      case "CHECKBOX":
        if (!Array.isArray(value)) {
          throw new BadRequestException(
            `"${field.label}" must contain multiple values`,
          );
        }

        if (!field.options) {
          throw new BadRequestException(
            `"${field.label}" has no available options`,
          );
        }

        for (const selectedValue of value) {
          if (!field.options.includes(selectedValue)) {
            throw new BadRequestException(`Invalid value for "${field.label}"`);
          }
        }

        break;

      default:
        throw new BadRequestException("Unsupported field type");
    }
  }

  async findAll(eventId: string) {
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return db
      .select()
      .from(registrationsTable)
      .where(eq(registrationsTable.eventId, eventId));
  }

  async findOne(eventId: string, registrationId: string) {
    const [registration] = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.id, registrationId),
          eq(registrationsTable.eventId, eventId),
        ),
      )
      .limit(1);

    if (!registration) {
      throw new NotFoundException("Registration not found");
    }

    const answers = await db
      .select()
      .from(registrationAnswersTable)
      .where(eq(registrationAnswersTable.registrationId, registrationId));

    return {
      ...registration,
      answers,
    };
  }

  async remove(eventId: string, registrationId: string) {
    const [registration] = await db
      .delete(registrationsTable)
      .where(
        and(
          eq(registrationsTable.id, registrationId),
          eq(registrationsTable.eventId, eventId),
        ),
      )
      .returning();

    if (!registration) {
      throw new NotFoundException("Registration not found");
    }

    return registration;
  }

  async checkInByQrToken(eventId: string, qrToken: string, userId: string) {
    const [registration] = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.eventId, eventId),
          eq(registrationsTable.qrToken, qrToken),
        ),
      )
      .limit(1);

    if (!registration) {
      throw new NotFoundException("Invalid QR code");
    }

    if (registration.checkedIn) {
      throw new ConflictException(
        "This registration has already been checked in",
      );
    }

    const [updatedRegistration] = await db
      .update(registrationsTable)
      .set({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: userId,
      })
      .where(eq(registrationsTable.id, registration.id))
      .returning();

    return {
      id: updatedRegistration.id,
      checkedIn: updatedRegistration.checkedIn,
      checkedInAt: updatedRegistration.checkedInAt,
    };
  }

  async cancelCheckIn(eventId: string, registrationId: string) {
    const [registration] = await db
      .select()
      .from(registrationsTable)
      .where(
        and(
          eq(registrationsTable.id, registrationId),
          eq(registrationsTable.eventId, eventId),
        ),
      )
      .limit(1);

    if (!registration) {
      throw new NotFoundException("Registration not found");
    }

    const [updatedRegistration] = await db
      .update(registrationsTable)
      .set({
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      })
      .where(eq(registrationsTable.id, registrationId))
      .returning();

    return updatedRegistration;
  }
}
