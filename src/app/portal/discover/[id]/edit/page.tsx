"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScholarshipForm } from "@/components/scholarship-form";
import { useStore } from "@/lib/store";
import type { ScholarshipInput } from "@/lib/types";

export default function EditScholarshipPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const { getScholarship } = useStore();
  const item = getScholarship(id);

  useEffect(() => {
    if (item && !item.owned) router.replace(`/portal/discover/${id}`);
  }, [item, id, router]);

  if (!item) {
    return (
      <div className="loading-stage" role="status">
        <div>
          <div className="pulse-ring" aria-hidden />
          <p>Finding that award…</p>
        </div>
      </div>
    );
  }

  if (!item.owned) return null;

  const initial: ScholarshipInput = {
    title: item.title,
    provider: item.provider,
    summary: item.summary,
    description: item.description,
    amount: item.amount,
    amountNote: item.amountNote,
    deadline: item.deadline,
    category: item.category,
    degreeLevel: item.degreeLevel,
    field: item.field,
    location: item.location,
    eligibility: item.eligibility,
    essayRequired: item.essayRequired,
    renewable: item.renewable,
    website: item.website,
    yearHint: item.yearHint,
    tags: item.tags,
  };

  return <ScholarshipForm mode="edit" id={id} initial={initial} />;
}
