import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [AuthModule, EventsModule, FormFieldsModule, RegistrationsModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
