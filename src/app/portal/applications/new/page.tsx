"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { useStore } from "@/lib/store";

function NewApplicationInner() {
  const searchParams = useSearchParams();
  const scholarshipId = searchParams.get("scholarship");
  const { getScholarship } = useStore();
  const linked = scholarshipId ? getScholarship(scholarshipId) : undefined;

  return (
    <ApplicationForm
      initial={{
        scholarshipId: linked?.id ?? null,
        title: linked?.title ?? "",
        provider: linked?.provider ?? "",
        amount: linked?.amount ? String(linked.amount) : "",
        amountNote: linked?.amountNote ?? "",
        deadline: linked?.deadline ?? "",
        status: "exploring",
        nextStep: "",
        notes: "",
      }}
    />
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={null}>
      <NewApplicationInner />
    </Suspense>
  );
}
