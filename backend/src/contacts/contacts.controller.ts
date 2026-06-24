import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { NextAuthGuard, AuthUser } from '../auth';

@Controller('contacts')
@UseGuards(NextAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  getContacts(@AuthUser() user: { email: string }) {
    return this.contactsService.getContacts(user.email);
  }

  @Post()
  addContact(
    @Body() body: { groupName: string; groupChatId: string },
    @AuthUser() user: { email: string; name: string },
  ) {
    return this.contactsService.addContact(
      user.email,
      user.name,
      body.groupName,
      body.groupChatId,
    );
  }

  @Delete(':id')
  deleteContact(@Param('id') id: string, @AuthUser() user: { email: string }) {
    // Verify ownership before deleting
    return this.contactsService.deleteContact(id, user.email);
  }
}
