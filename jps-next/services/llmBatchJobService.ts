import { PrismaClient, Provider, JobType, JobStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

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
}
