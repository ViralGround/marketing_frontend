import { redirect } from "next/navigation";

/** /admin 루트는 랜딩이 없어 404였다 — KPI 대시보드를 관리자 홈으로 쓴다. */
export default function AdminRootPage() {
  redirect("/admin/dashboard");
}
