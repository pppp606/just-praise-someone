import { NextResponse } from 'next/server';
import { NotificationService } from '../../../services/notificationService';
import { handleServiceError } from '../../../utils/errorHandler';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('user_id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');

    const result = await NotificationService.getNotifications(userId, page);

    return NextResponse.json(result);
  } catch (error) {
    return handleServiceError(error);
  }
} 