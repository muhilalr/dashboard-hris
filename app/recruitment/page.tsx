import {
  getOdooRecruitmentBoard,
  type OdooRecruitmentBoard,
} from "@/lib/odoo";

import RecruitmentClientPage from "./recruitment-client";

const emptyBoard: OdooRecruitmentBoard = {
  stages: [],
  applicants: [],
  jobs: [],
};

export default async function RecruitmentPage() {
  try {
    const board = await getOdooRecruitmentBoard();

    return <RecruitmentClientPage initialBoard={board} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data recruitment.";

    return <RecruitmentClientPage initialBoard={emptyBoard} initialError={message} />;
  }
}
