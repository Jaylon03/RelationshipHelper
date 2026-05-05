import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Scan, PainPoint } from "@/lib/types";
import ResultsView from "./ResultsView";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const { scanId } = await params;

  const admin = createAdminClient();

  const { data: scan, error: scanError } = await admin
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .single();

  if (scanError || !scan) notFound();

  const { data: painPoints } = await admin
    .from("pain_points")
    .select("*")
    .eq("scan_id", scanId)
    .order("rank", { ascending: true });

  return (
    <ResultsView
      scan={scan as Scan}
      painPoints={(painPoints ?? []) as PainPoint[]}
    />
  );
}
