"use client";

import { Avatar } from "../ui/Avatar";
import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";
import { TiltCard, MagneticLink } from "@/components/animations";
import type { Person } from "./data";

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  return (
    <TiltCard className="person-card">
      <div className="person-header">
        <Avatar initials={person.initials} background={person.color} color={person.fg} />
        <div className="person-info">
          <div className="person-name">{person.name}</div>
          <div className="person-role">{person.role}</div>
        </div>
      </div>
      <div className="person-bio">{person.bio}</div>
      <div className="person-tags">
        {person.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
      <div className="person-link">
        <MagneticLink>
          <Button
            variant="secondary"
            size="xs"
            href={`https://x.com/${person.handle.replace("@", "")}`}
            target="_blank"
            rel="noopener"
          >
            Follow on X &rarr;
          </Button>
        </MagneticLink>
      </div>
    </TiltCard>
  );
}
