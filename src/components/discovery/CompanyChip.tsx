import Link from "next/link";

interface CompanyChipProps {
  initials: string;
  name: string;
  tag: string;
  bg: string;
  href?: string;
}

export function CompanyChip({ initials, name, tag: tagLabel, bg, href = "#" }: CompanyChipProps) {
  return (
    <Link className="company-chip" href={href}>
      <div className="cc-logo" style={{ background: bg }}>
        {initials}
      </div>
      <div className="cc-info">
        <div className="cc-name">{name}</div>
        <div className="cc-tag">{tagLabel}</div>
      </div>
    </Link>
  );
}
