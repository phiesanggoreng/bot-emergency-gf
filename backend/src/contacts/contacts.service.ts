import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateUser(email: string, name: string) {
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password_hash: '', // not used since we use next-auth
        },
      });
    }
    return user;
  }

  async getContacts(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return [];

    return this.prisma.telegramGroup.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });
  }

  async addContact(
    email: string,
    name: string,
    groupName: string,
    groupChatId: string,
  ) {
    const user = await this.getOrCreateUser(email, name);

    return this.prisma.telegramGroup.create({
      data: {
        user_id: user.id,
        group_name: groupName,
        group_chat_id: groupChatId,
      },
    });
  }

  async deleteContact(id: string, email: string) {
    // Verify ownership: only the owner can delete their contacts
    const contact = await this.prisma.telegramGroup.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!contact) {
      throw new NotFoundException('Kontak tidak ditemukan.');
    }

    if (contact.user.email !== email) {
      throw new ForbiddenException(
        'Kamu tidak memiliki akses untuk menghapus kontak ini.',
      );
    }

    return this.prisma.telegramGroup.delete({
      where: { id },
    });
  }
}
