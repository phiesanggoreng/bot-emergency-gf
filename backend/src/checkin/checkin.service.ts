import { Injectable, Logger } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { PrismaService } from '../prisma/prisma.service';
import {
  TemplatesService,
  DEFAULT_TEMPLATES,
} from '../templates/templates.service';
import type { TemplateData } from '../templates/templates.service';

export type CheckinStatus = 'SAFE' | 'SICK_BUT_SAFE' | 'RESTING' | 'EMERGENCY';

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly prisma: PrismaService,
    private readonly templatesService: TemplatesService,
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

  async getNotificationLogs(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return [];

    return this.prisma.notificationLog.findMany({
      where: { user_id: user.id },
      orderBy: { sent_at: 'desc' },
      take: 50, // last 50 notification logs
    });
  }

  async sendCheckin(
    chatId: string,
    status: CheckinStatus,
    userName: string,
    email?: string,
  ) {
    const now = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    this.logger.log(`Sending ${status} to chat ${chatId} for user ${userName}`);

    // Fetch user and groups
    let userId: string | null = null;
    let userGroups: { group_chat_id: string; group_name: string }[] = [];
    if (email) {
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: { TelegramGroups: true },
      });
      if (!user) {
        user = await this.prisma.user.create({
          data: { email, name: userName, password_hash: '' },
          include: { TelegramGroups: true },
        });
      }
      userId = user.id;
      userGroups = user.TelegramGroups;
    }

    // Get effective template (custom if set, otherwise default)
    const statusInfo: TemplateData = userId
      ? await this.templatesService.getEffectiveTemplate(userId, status)
      : DEFAULT_TEMPLATES[status] || DEFAULT_TEMPLATES.SAFE;

    // Compose message text
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

    // Save checkin history
    if (userId) {
      await this.prisma.checkin.create({
        data: {
          user_id: userId,
          status: status,
          message: statusInfo.label,
        },
      });
    }

    // Determine target chat IDs
    let targetChatIds: string[] = [];
    if (chatId === 'ALL') {
      targetChatIds =
        userGroups.length > 0 ? userGroups.map((g) => g.group_chat_id) : [];
    } else {
      targetChatIds = [chatId];
    }

    if (targetChatIds.length === 0) {
      throw new Error(
        'Tidak ada kontak tujuan. Silakan tambahkan kontak Telegram terlebih dahulu.',
      );
    }

    this.logger.log(
      `Sending ${status} to chats [${targetChatIds.join(',')}] for user ${userName}`,
    );

    // Determine notification type based on status
    const notificationType = status === 'EMERGENCY' ? 'EMERGENCY' : 'CHECKIN';

    // Send telegram message to all targets and log each result
    const sendResults = await Promise.all(
      targetChatIds.map(async (targetId) => {
        // Determine target type (group IDs start with minus)
        const targetType = targetId.startsWith('-') ? 'GROUP' : 'PERSONAL';

        // Find group name if available
        const matchingGroup = userGroups.find(
          (g) => g.group_chat_id === targetId,
        );
        const targetLabel = matchingGroup ? matchingGroup.group_name : targetId;

        try {
          await this.bot.telegram.sendMessage(targetId, text);

          // Log successful notification
          if (userId) {
            await this.prisma.notificationLog.create({
              data: {
                user_id: userId,
                target_type: targetType,
                target_chat_id: targetId,
                type: notificationType,
                message: `${statusInfo.emoji} ${statusInfo.label} → ${targetLabel}`,
                status: 'SUCCESS',
              },
            });
          }

          this.logger.log(`✅ Sent to ${targetId} (${targetLabel})`);
          return { targetId, targetLabel, success: true };
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Unknown error';
          this.logger.error(
            `❌ Failed to send to ${targetId} (${targetLabel})`,
            err,
          );

          // Log failed notification
          if (userId) {
            await this.prisma.notificationLog.create({
              data: {
                user_id: userId,
                target_type: targetType,
                target_chat_id: targetId,
                type: notificationType,
                message: `${statusInfo.emoji} ${statusInfo.label} → ${targetLabel}`,
                status: 'FAILED',
              },
            });
          }

          return { targetId, targetLabel, success: false, error: errMsg };
        }
      }),
    );

    const successCount = sendResults.filter((r) => r.success).length;
    const failedCount = sendResults.filter((r) => !r.success).length;

    return {
      success: successCount > 0,
      status,
      sentAt: now,
      targets: targetChatIds.length,
      delivered: successCount,
      failed: failedCount,
      details: sendResults,
    };
  }
}
