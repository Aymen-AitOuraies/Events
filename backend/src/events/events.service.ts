import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { eventsTable } from "../db/schema";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Injectable()
export class EventsService {
  async create(createEventDto: CreateEventDto) {
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const [event] = await db
      .insert(eventsTable)
      .values({
        title: createEventDto.title,
        description: createEventDto.description,
        location: createEventDto.location,
        startDate,
        endDate,
      })
      .returning();

    return event;
  }

  async findAll() {
    return db.select().from(eventsTable);
  }

  async findOne(id: string) {
    const [event] = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.findOne(id);

    const startDate = updateEventDto.startDate
      ? new Date(updateEventDto.startDate)
      : existingEvent.startDate;

    const endDate = updateEventDto.endDate
      ? new Date(updateEventDto.endDate)
      : existingEvent.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException("End date must be after start date");
    }

    const [event] = await db
      .update(eventsTable)
      .set({
        ...updateEventDto,
        startDate,
        endDate,
        updatedAt: new Date(),
      })
      .where(eq(eventsTable.id, id))
      .returning();

    return event;
  }

  async remove(id: string) {
    await this.findOne(id);

    await db.delete(eventsTable).where(eq(eventsTable.id, id));

    return {
      message: "Event deleted successfully",
    };
  }
}
