import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { BotModule } from './bot/bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckinController } from './checkin/checkin.controller';
import { CheckinService } from './checkin/checkin.service';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsService } from './contacts/contacts.service';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesService } from './templates/templates.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>('TELEGRAM_BOT_TOKEN') || 'dummy',
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    BotModule,
  ],
  controllers: [
    AppController,
    CheckinController,
    ContactsController,
    TemplatesController,
  ],
  providers: [AppService, CheckinService, ContactsService, TemplatesService],
})
export class AppModule {}
