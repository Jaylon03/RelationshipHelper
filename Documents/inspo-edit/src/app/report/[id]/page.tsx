import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Report } from "@/lib/types";
import ReportView from "./ReportView";

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const paymentPending = sp.paid === "true";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const report = data as Report;

  return (
    <ReportView
      report={report}
      isPaid={report.is_paid}
      paymentPending={paymentPending && !report.is_paid}
    />
  );
}
