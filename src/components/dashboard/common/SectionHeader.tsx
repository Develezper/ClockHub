"use client";

import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function SectionHeader({ title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="page-heading">{title}</h2>
        {subtitle ? <p className="page-subheading">{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
