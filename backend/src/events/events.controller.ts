import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard/jwt-auth.guard";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { EventsService } from "./events.service";
import { cloudinary } from "../cloudinary";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post("upload-image")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadImage(
    @UploadedFile()
    file: {
      mimetype: string;
      originalname: string;
      buffer: Buffer;
    },
  ) {
    if (!file || !file.mimetype.startsWith("image/")) {
      throw new BadRequestException("Please upload an image file");
    }

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "alc-events",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(
                new Error(
                  typeof error === "string"
                    ? error
                    : "Cloudinary image upload failed",
                ),
              );
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("Cloudinary returned no upload result"));
            }
          },
        );

        uploadStream.end(file.buffer);
      },
    );

    return {
      imageUrl: result.secure_url,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@Param("id") id: string) {
    return this.eventsService.remove(id);
  }
}
