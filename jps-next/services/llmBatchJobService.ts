import { PrismaClient, Provider, JobType, JobStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { GithubEventService } from './githubEventService';
import { TwitterService } from './twitterService';
import { PraiseService } from './praiseService';
import OpenAI from 'openai';
import { generatePraisePrompt } from '../prompts/praise';

// 環境変数のチェック
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'TWITTER_BEARER_TOKEN',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PraiseResponse {
  body: string;
  skills: string[];
}

export class LlmBatchJobService {
  static async createLlmBatchJob(
    userId: string,
    provider: Provider,
    jobType: JobType,
    metadata: object,
    status: JobStatus = JobStatus.pending
  ) {
    const jobId = uuidv4();

    return await prisma.llmBatchJob.create({
      data: {
        id: jobId,
        userId,
        provider,
        jobId,
        jobType,
        metadata,
        status,
      },
    });
  }

  static async processPendingJobs() {
    // 処理待ちのジョブを取得
    const pendingJobs = await prisma.llmBatchJob.findMany({
      where: {
        status: JobStatus.pending,
      },
      include: {
        user: true,
      },
    });

    for (const job of pendingJobs) {
      try {
        // ジョブのステータスを処理中に更新
        await prisma.llmBatchJob.update({
          where: { id: job.id },
          data: { status: JobStatus.processing },
        });

        // 1. GitHubとTwitterの情報を取得
        const githubData = await GithubEventService.getUserPublicEvents(
          job.user.login || ''
        );

        let twitterData = null;
        if (githubData.user.twitter_username) {
          twitterData = await TwitterService.getUserTweets(
            githubData.user.twitter_username
          );
        }

        // 2. ChatGPTで褒めの文言を生成
        const prompt = generatePraisePrompt(
          githubData.user,
          githubData.event,
          twitterData?.user,
          twitterData?.tweets
        );

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'あなたは、ユーザーの活動を分析して、具体的で心温まる褒めの言葉を生成するアシスタントです。JSON形式で出力してください。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        const response = completion.choices[0].message.content;
        let praiseResponse: PraiseResponse;

        try {
          praiseResponse = JSON.parse(response || '{}') as PraiseResponse;
        } catch (error) {
          console.error('Error parsing praise response:', error);
          throw new Error('Invalid praise response format');
        }

        // 3. Praiseに登録
        await PraiseService.createPraise({
          givenUserId: job.userId, // システムからの褒めなので、システムユーザーのIDを使用
          receivedUserId: job.userId,
          content: praiseResponse.body,
          skillCodes: praiseResponse.skills,
        });

        // ジョブのステータスを完了に更新
        await prisma.llmBatchJob.update({
          where: { id: job.id },
          data: {
            status: JobStatus.completed,
            response: {
              praiseContent: praiseResponse.body,
              skills: praiseResponse.skills,
            },
          },
        });
      } catch (error) {
        console.error(`Error processing job ${job.id}:`, error);
        // エラーが発生した場合、ジョブのステータスを失敗に更新
        await prisma.llmBatchJob.update({
          where: { id: job.id },
          data: {
            status: JobStatus.failed,
            response: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        });
      }
    }
  }
}
