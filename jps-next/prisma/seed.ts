import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const skills = [
  { code: 'code_quality', name: 'コード品質', sortOrder: 1 },
  { code: 'debugging', name: 'デバッグ力', sortOrder: 2 },
  { code: 'code_review', name: 'コードレビュー', sortOrder: 3 },
  { code: 'security', name: 'セキュリティ', sortOrder: 4 },
  { code: 'hacking', name: 'ハック', sortOrder: 5 },
  { code: 'speed', name: 'スピード', sortOrder: 6 },
  { code: 'technical_insight', name: '技術的知見', sortOrder: 7 },
  { code: 'tech_trend_catchup', name: '技術トレンドのキャッチアップ', sortOrder: 8 },
  { code: 'learning', name: '学習意欲', sortOrder: 9 },
  { code: 'problem_solving', name: '問題解決力', sortOrder: 10 },
  { code: 'design_sense', name: 'デザインセンス（UI/UX）', sortOrder: 11 },
  { code: 'adaptability', name: '現場への適応力', sortOrder: 12 },
  { code: 'self_driven', name: '自走力', sortOrder: 13 },
  { code: 'business_sense', name: 'ビジネスセンス', sortOrder: 14 },
  { code: 'leadership', name: 'リーダーシップ', sortOrder: 15 },
  { code: 'team_building', name: 'チームビルディング', sortOrder: 16 },
  { code: 'team_support', name: 'チームサポート', sortOrder: 17 },
  { code: 'communication', name: 'コミュニケーション力', sortOrder: 18 },
  { code: 'flexibility', name: '柔軟性', sortOrder: 19 },
  { code: 'documentation', name: 'ドキュメント作成力', sortOrder: 20 },
  { code: 'expression', name: '発信力', sortOrder: 21 },
];

export const seed = async () => {
  console.log('Seeding skills...');
  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { code: skill.code }, // `code` でデータの存在を確認
      update: {}, // 存在する場合は何も更新しない
      create: {
        code: skill.code,
        name: skill.name,
        sortOrder: skill.sortOrder,
      },
    });
  }
  console.log('Seeding completed!');
}

// NOTE: コマンドから直接実行された場合
if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
