import { Injectable, Logger } from '@nestjs/common';
import { Update, Start, Command, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  @Start()
  async onStart(@Ctx() ctx: Context) {
    this.logger.log(`/start command received from chat ${ctx.chat?.id}`);
    const isGroup =
      ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';

    if (isGroup) {
      await ctx.reply(
        `Halo! Sweety Bot siap mengirimkan notifikasi check-in ke grup ini.\n\nGunakan perintah /setup_group untuk mendapatkan Chat ID grup ini, lalu masukkan ke Dashboard.`,
      );
    } else {
      await ctx.reply(
        `Halo! Saya adalah Sweety Bot 💕\n\nSaya dibuat untuk mengirimkan notifikasi satu-klik dari pasanganmu.\nJika kamu ingin bot ini mengirim pesan ke grup, silakan masukkan bot ke grup tersebut lalu ketik /setup_group.`,
      );
    }
  }

  @Command('setup_group')
  async onSetupGroup(@Ctx() ctx: Context) {
    const chatId = ctx.chat?.id;
    const chatTitle =
      ctx.chat && 'title' in ctx.chat ? ctx.chat.title : 'Private Chat';
    this.logger.log(
      `/setup_group received - Chat ID: ${chatId}, Title: ${chatTitle}`,
    );

    await ctx.reply(
      `✅ BERHASIL!\n\nNama Chat: ${chatTitle}\nChat ID: ${chatId}\n\nSilakan salin (copy) Chat ID di atas (termasuk tanda minus jika ada) dan masukkan ke menu "Kontak Telegram" di Dashboard Sweety Bot.`,
    );
  }
}
