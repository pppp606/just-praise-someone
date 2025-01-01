import { PraiseService } from '../../../services/praiseService';
import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../utils/errorHandler';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const praise = await PraiseService.prisma.findUnique({
      where: { id },
      include: { skills: true },
    });
    return new Response(JSON.stringify(praise), { status: 200 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    const data = await req.json();
    const newPraise = await PraiseService.createPraise({
      ...data,
      givenUserId: userId,
    });

    return new Response(JSON.stringify(newPraise), { status: 201 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    const data = await req.json();
    const updatedPraise = await PraiseService.updatePraise(id, userId, data);
    return new Response(JSON.stringify(updatedPraise), { status: 200 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    await PraiseService.deletePraise(id, userId);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    const { isApproved } = await req.json();
    if (typeof isApproved !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Invalid isApproved value' }),
        { status: 400 }
      );
    }

    const updatedPraise = await PraiseService.updateIsApproved(
      id,
      userId,
      isApproved
    );
    return new Response(JSON.stringify(updatedPraise), { status: 200 });
  } catch (error) {
    console.log(error);
    return handleServiceError(error);
  }
}
