import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CheckinService } from './checkin.service';
import type { CheckinStatus } from './checkin.service';
import { NextAuthGuard, AuthUser } from '../auth';

class CheckinDto {
  chatId: string;
  status: CheckinStatus;
}

@Controller('checkin')
@UseGuards(NextAuthGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('history')
  getHistory(@AuthUser() user: { email: string }) {
    return this.checkinService.getHistory(user.email);
  }

  @Get('notifications')
  getNotificationLogs(@AuthUser() user: { email: string }) {
    return this.checkinService.getNotificationLogs(user.email);
  }

  @Post()
  async checkin(
    @Body() body: CheckinDto,
    @AuthUser() user: { email: string; name: string },
  ) {
    const { chatId, status } = body;

    if (!chatId || !status) {
      throw new HttpException(
        'chatId dan status wajib diisi.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validStatuses: CheckinStatus[] = [
      'SAFE',
      'SICK_BUT_SAFE',
      'RESTING',
      'EMERGENCY',
    ];
    if (!validStatuses.includes(status)) {
      throw new HttpException(
        `Status tidak valid. Gunakan: ${validStatuses.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Use authenticated user's name & email — no spoofing possible
      const result = await this.checkinService.sendCheckin(
        chatId,
        status,
        user.name,
        user.email,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        `Gagal mengirim pesan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
