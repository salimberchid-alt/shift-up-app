"use client";

import { useState } from "react";
import Link from "next/link";
import { LangProvider, useLang } from "@/lib/lang";
import { Icon } from "@/components/dashboard/shared";
import EmployerDashboard from "../DemoEmployerDashboard";
import WorkerDashboard from "../DemoWorkerDashboard";
import FreelancerDashboard from "../DemoFreelancerDashboard";

type Role = "employer" | "worker" | "freelancer";

// Public demo only — fictive data, no auth, no connection to real accounts.
// The real dashboard (session + profiles.role, no switching) lives at
// /dashboard. Keep the two completely separate: never add this switcher
// there, and never gate this page behind login.
function DemoDashboard({ role }: { role: Role }) {
  if (role === "worker") return <WorkerDashboard />;
  if (role === "freelancer") return <FreelancerDashboard />;
  return <EmployerDashboard />;
}

function DemoBanner() {
  const { lang } = useLang();
  const isFr = lang === "fr";
  return (
    <div className="fixed top-0 inset-x-0 z-[2500] bg-[#F5B93F] text-[#231506] text-center text-[11px] font-extrabold py-1.5 flex items-center justify-center gap-2">
      <Icon name="star" size={11} />
      {isFr ? "Mode démo — données fictives, aucun compte réel" : "Demo mode — fictive data, no real account"}
      <Link href="/dashboard" className="underline underline-offset-2 ml-1">
        {isFr ? "Aller au vrai dashboard →" : "Go to the real dashboard →"}
      </Link>
    </div>
  );
}

function DemoSwitcher({ view, setView }: { view: Role; setView: (r: Role) => void }) {
  const { lang } = useLang();
  const isFr = lang === "fr";
  const ROLES: { id: Role; label: string }[] = [
    { id: "employer", label: isFr ? "Employeur" : "Employer" },
    { id: "worker", label: isFr ? "Travailleur" : "Worker" },
    { id: "freelancer", label: isFr ? "Freelance" : "Freelancer" },
  ];
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[3000]">
      <div className="glass-pill rounded-full p-1 flex gap-1">
        {ROLES.map((r) => (
          <button
            key={r.id}
            onClick={() => setView(r.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold cursor-pointer border-none transition-colors ${
              view === r.id ? "grad-violet text-white" : "bg-transparent text-white/50 hover:text-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DemoPage() {
  const [role, setRole] = useState<Role>("employer");
  return (
    <div className="pt-7">
      <DemoBanner />
      <DemoDashboard role={role} />
      <DemoSwitcher view={role} setView={setRole} />
    </div>
  );
}

export default function Page() {
  return (
    <LangProvider>
      <DemoPage />
    </LangProvider>
  );
}
