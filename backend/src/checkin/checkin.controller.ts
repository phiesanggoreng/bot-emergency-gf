import { Controller, Get, Post, Body, HttpException, HttpStatus, Query } from '@nestjs/common';
import { CheckinService, CheckinStatus } from './checkin.service';

class CheckinDto {
  chatId: string;
  status: CheckinStatus;
  userName: string;
  email?: string;
}

@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Get('history')
  getHistory(@Query('email') email: string) {
    if (!email) return [];
    return this.checkinService.getHistory(email);
  }

  @Post()
  async checkin(@Body() body: CheckinDto) {
    const { chatId, status, userName, email } = body;

    if (!chatId || !status || !userName) {
      throw new HttpException(
        'chatId, status, dan userName wajib diisi.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validStatuses: CheckinStatus[] = ['SAFE', 'SICK_BUT_SAFE', 'RESTING', 'EMERGENCY'];
    if (!validStatuses.includes(status as CheckinStatus)) {
      throw new HttpException(
        `Status tidak valid. Gunakan: ${validStatuses.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.checkinService.sendCheckin(chatId, status as CheckinStatus, userName, email);
      return result;
    } catch (error) {
      throw new HttpException(
        `Gagal mengirim pesan: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

