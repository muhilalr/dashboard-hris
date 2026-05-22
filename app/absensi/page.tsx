import {
  getOdooAttendanceBoard,
  type OdooAttendanceBoard,
} from "@/lib/odoo";

import AttendanceClientPage from "./attendance-client";

const emptyBoard: OdooAttendanceBoard = {
  employees: [],
  generatedOn: new Date().toISOString(),
  monthLabel: new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  }),
};

export default async function AttendancePage() {
  try {
    const board = await getOdooAttendanceBoard();

    return <AttendanceClientPage initialBoard={board} />;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal memuat data absensi.";

    return (
      <AttendanceClientPage initialBoard={emptyBoard} initialError={message} />
    );
  }
}
