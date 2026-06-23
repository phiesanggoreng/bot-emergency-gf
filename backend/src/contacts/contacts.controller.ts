import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  getContacts(@Query('email') email: string) {
    if (!email) return [];
    return this.contactsService.getContacts(email);
  }

  @Post()
  addContact(@Body() body: { email: string; name: string; groupName: string; groupChatId: string }) {
    return this.contactsService.addContact(body.email, body.name, body.groupName, body.groupChatId);
  }

  @Delete(':id')
  deleteContact(@Param('id') id: string) {
    return this.contactsService.deleteContact(id);
  }
}
