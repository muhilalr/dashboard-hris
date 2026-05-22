import { NextResponse } from "next/server";

import {
  getOdooRecruitmentBoard,
  updateOdooRecruitmentApplicantStage,
} from "@/lib/odoo";

export async function GET() {
  try {
    const board = await getOdooRecruitmentBoard();

    return NextResponse.json(board);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengambil data recruitment.";

    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as {
      applicantId?: number;
      stageId?: number;
    };

    if (!payload.applicantId || !payload.stageId) {
      return NextResponse.json(
        { message: "applicantId dan stageId wajib diisi." },
        { status: 400 },
      );
    }

    await updateOdooRecruitmentApplicantStage(
      payload.applicantId,
      payload.stageId,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengubah stage pelamar.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
