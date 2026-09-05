import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { FormFieldsModule } from './form-fields/form-fields.module';

@Module({
  imports: [AuthModule, EventsModule, FormFieldsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
