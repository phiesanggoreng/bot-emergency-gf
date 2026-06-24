import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { NextAuthGuard, AuthUser } from '../auth';

@Controller('templates')
@UseGuards(NextAuthGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  getTemplates(@AuthUser() user: { email: string }) {
    return this.templatesService.getTemplates(user.email);
  }

  @Put(':status')
  updateTemplate(
    @Param('status') status: string,
    @Body() body: { emoji: string; label: string; message: string },
    @AuthUser() user: { email: string; name: string },
  ) {
    return this.templatesService.upsertTemplate(user.email, user.name, {
      status: status.toUpperCase(),
      emoji: body.emoji,
      label: body.label,
      message: body.message,
    });
  }

  @Delete(':status')
  resetTemplate(
    @Param('status') status: string,
    @AuthUser() user: { email: string },
  ) {
    return this.templatesService.resetTemplate(
      user.email,
      status.toUpperCase(),
    );
  }
}
