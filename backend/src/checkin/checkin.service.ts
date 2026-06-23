import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';

export type CheckinStatus = 'SAFE' | 'SICK_BUT_SAFE' | 'RESTING' | 'EMERGENCY';

const STATUS_MESSAGES: Record<CheckinStatus, { emoji: string; label: string; message: string }> = {
  SAFE: {
    emoji: '✅',
    label: 'Aman',
    message: 'sedang baik-baik saja dan beraktivitas normal.',
  },
  SICK_BUT_SAFE: {
    emoji: '🤒',
    label: 'Sakit tapi Aman',
    message: 'sedang kurang sehat, tapi belum membutuhkan bantuan darurat.',
  },
  RESTING: {
    emoji: '😴',
    label: 'Istirahat',
    message: 'sedang istirahat dan menjauh dari HP untuk sementara.',
  },
  EMERGENCY: {
    emoji: '🚨',
    label: 'DARURAT',
    message: 'MEMBUTUHKAN BANTUAN SEGERA! Tolong segera hubungi!',
  },
};

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly prisma: PrismaService,
  ) {}

  async getHistory(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return [];
    
    return this.prisma.checkin.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 20, // last 20 checkins
    });
  }

  async sendCheckin(chatId: string, status: CheckinStatus, userName: string, email?: string) {
    const statusInfo = STATUS_MESSAGES[status];

    if (!statusInfo) {
      throw new Error(`Unknown status: ${status}`);
    }

    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    let text: string;

    if (status === 'EMERGENCY') {
      text =
        `🚨🚨🚨 DARURAT! 🚨🚨🚨\n\n` +
        `${userName} ${statusInfo.message}\n\n` +
        `⏰ Waktu: ${now}\n\n` +
        `⚠️ Pesan ini dikirim dengan prioritas tinggi dari Sweety Bot.`;
    } else {
      text =
        `${statusInfo.emoji} Check-in: ${statusInfo.label}\n\n` +
        `${userName} ${statusInfo.message}\n\n` +
        `⏰ ${now}\n` +
        `📱 via Sweety Bot`;
    }

    this.logger.log(`Sending ${status} to chat ${chatId} for user ${userName}`);

    // Fetch user groups
    let userGroups: any[] = [];
    if (email) {
      let user = await this.prisma.user.findUnique({ where: { email }, include: { TelegramGroups: true } });
      if (!user) {
        user = await this.prisma.user.create({
          data: { email, name: userName, password_hash: '' },
          include: { TelegramGroups: true }
        });
      }
      userGroups = user.TelegramGroups;
      
      // Save checkin history
      await this.prisma.checkin.create({
        data: {
          user_id: user.id,
          status: status,
          message: statusInfo.label,
        },
      });
    }

    // Determine target chat IDs
    let targetChatIds: string[] = [];
    if (chatId === 'ALL') {
      targetChatIds = userGroups.length > 0 ? userGroups.map(g => g.group_chat_id) : [];
    } else {
      targetChatIds = [chatId];
    }

    if (targetChatIds.length === 0) {
      throw new Error("Tidak ada kontak tujuan. Silakan tambahkan kontak Telegram terlebih dahulu.");
    }

    this.logger.log(`Sending ${status} to chats [${targetChatIds.join(',')}] for user ${userName}`);

    // Send telegram message to all targets
    const sendPromises = targetChatIds.map(id => 
      this.bot.telegram.sendMessage(id, text).catch(err => {
        this.logger.error(`Failed to send telegram message to ${id}`, err);
      })
    );
    
    await Promise.all(sendPromises);

    return { success: true, status, sentAt: now, targets: targetChatIds.length };
  }
}

