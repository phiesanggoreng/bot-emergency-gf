import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TemplateData {
  status: string;
  emoji: string;
  label: string;
  message: string;
}

// Default templates — used when user hasn't customized
export const DEFAULT_TEMPLATES: Record<string, TemplateData> = {
  SAFE: {
    status: 'SAFE',
    emoji: '✅',
    label: 'Aman',
    message: 'sedang baik-baik saja dan beraktivitas normal.',
  },
  SICK_BUT_SAFE: {
    status: 'SICK_BUT_SAFE',
    emoji: '🤒',
    label: 'Sakit tapi Aman',
    message: 'sedang kurang sehat, tapi belum membutuhkan bantuan darurat.',
  },
  RESTING: {
    status: 'RESTING',
    emoji: '😴',
    label: 'Istirahat',
    message: 'sedang istirahat dan menjauh dari HP untuk sementara.',
  },
  EMERGENCY: {
    status: 'EMERGENCY',
    emoji: '🚨',
    label: 'DARURAT',
    message: 'MEMBUTUHKAN BANTUAN SEGERA! Tolong segera hubungi!',
  },
};

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all templates for a user, merging defaults with any custom ones.
   * Returns 4 templates (one per status), with custom overrides where they exist.
   */
  async getTemplates(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Start with defaults
    const templates = { ...DEFAULT_TEMPLATES };

    if (user) {
      const customTemplates = await this.prisma.messageTemplate.findMany({
        where: { user_id: user.id },
      });

      // Override defaults with custom templates
      for (const ct of customTemplates) {
        templates[ct.status] = {
          status: ct.status,
          emoji: ct.emoji,
          label: ct.label,
          message: ct.message,
        };
      }
    }

    // Return as array sorted by status order
    const order = ['SAFE', 'SICK_BUT_SAFE', 'RESTING', 'EMERGENCY'];
    return order.map((status) => ({
      ...templates[status],
      isCustom: user
        ? !!(user && templates[status] !== DEFAULT_TEMPLATES[status])
        : false,
    }));
  }

  /**
   * Update (or create) a custom template for a specific status.
   */
  async upsertTemplate(email: string, name: string, data: TemplateData) {
    // Get or create user
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email, name, password_hash: '' },
      });
    }

    return this.prisma.messageTemplate.upsert({
      where: {
        user_id_status: {
          user_id: user.id,
          status: data.status,
        },
      },
      update: {
        emoji: data.emoji,
        label: data.label,
        message: data.message,
      },
      create: {
        user_id: user.id,
        status: data.status,
        emoji: data.emoji,
        label: data.label,
        message: data.message,
      },
    });
  }

  /**
   * Reset a template back to its default for a specific status.
   */
  async resetTemplate(email: string, status: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { reset: true };

    await this.prisma.messageTemplate.deleteMany({
      where: {
        user_id: user.id,
        status: status,
      },
    });

    return { reset: true, status };
  }

  /**
   * Get the effective template for a user + status.
   * Used by CheckinService when composing messages.
   */
  async getEffectiveTemplate(
    userId: string,
    status: string,
  ): Promise<TemplateData> {
    const custom = await this.prisma.messageTemplate.findUnique({
      where: {
        user_id_status: {
          user_id: userId,
          status: status,
        },
      },
    });

    if (custom) {
      return {
        status: custom.status,
        emoji: custom.emoji,
        label: custom.label,
        message: custom.message,
      };
    }

    return DEFAULT_TEMPLATES[status] || DEFAULT_TEMPLATES.SAFE;
  }
}
