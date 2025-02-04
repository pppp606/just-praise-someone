import { LlmBatchJobService } from '../../services/llmBatchJobService';
import { PrismaClient, Provider, JobType, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();
let user: any;

describe('LlmBatchJobService', () => {
  beforeEach(async () => {
    user = await prisma.user.create({
      data: {
        id: 'test-user-123',
        name: 'Test User',
        email: 'test@example.com',
      },
    });
  });

  test('バッチジョブを正しく作成できる', async () => {
    const provider = Provider.openai;
    const jobType = JobType.praise;
    const metadata = { input: 'Hello' };

    const job = await LlmBatchJobService.createLlmBatchJob(
      user.id || '',
      provider,
      jobType,
      metadata
    );

    expect(job).toBeDefined();
    expect(job.userId).toBe(user.id);
    expect(job.provider).toBe(provider);
    expect(job.jobType).toBe(jobType);
    expect(job.status).toBe(JobStatus.pending);
    expect(job.metadata).toEqual(metadata);
  });

  test('デフォルトの `pending` ステータスでジョブを作成できる', async () => {
    const provider = Provider.openai;
    const jobType = JobType.praise;
    const metadata = { input: 'Hello' };

    const job = await LlmBatchJobService.createLlmBatchJob(
      user.id || '',
      provider,
      jobType,
      metadata
    );

    expect(job.status).toBe(JobStatus.pending);
  });

  test('指定したステータスでジョブを作成できる', async () => {
    const provider = Provider.openai;
    const jobType = JobType.praise;
    const metadata = { input: 'Hello' };

    const job = await LlmBatchJobService.createLlmBatchJob(
      user.id || '',
      provider,
      jobType,
      metadata,
      JobStatus.processing
    );

    expect(job.status).toBe(JobStatus.processing);
  });
});
