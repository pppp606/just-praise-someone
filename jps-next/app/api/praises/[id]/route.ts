import { PraiseService } from '../../../../services/praiseService';
import {
  ErrorCode,
  handleError,
  handleServiceError,
} from '../../../../utils/errorHandler';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const praise = await PraiseService.getPraiseById(id);
    return NextResponse.json(praise, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  const userId = req.headers.get('user_id');
  if (!userId) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const data = await req.json();
    const updatedPraise = await PraiseService.updatePraise(id, userId, data);
    return NextResponse.json(updatedPraise, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  const userId = req.headers.get('user_id');
  if (!userId) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    await PraiseService.deletePraise(id, userId);
    return NextResponse.json(
      {
        message: 'Praise deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    return handleServiceError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return handleError(ErrorCode.NotFound);
  }

  try {
    const userId = req.headers.get('user_id');
    if (!userId) {
      return handleError(ErrorCode.NotFound);
    }

    const { isApproved } = await req.json();
    if (typeof isApproved !== 'boolean') {
      return handleError(ErrorCode.ValidationError);
    }

    const updatedPraise = await PraiseService.updateIsApproved(
      id,
      userId,
      isApproved
    );
    return NextResponse.json(updatedPraise, { status: 200 });
  } catch (error) {
    return handleServiceError(error);
  }
}
