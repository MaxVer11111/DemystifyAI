import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";
import type { Skill } from "./data";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="skill-card">
      <div className="skill-header">
        <h3 style={{ fontSize: 17 }}>{skill.title}</h3>
        <span className="skill-stars">★ {skill.stars}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
        by <span style={{ fontWeight: 500, color: "var(--fg)" }}>{skill.author}</span> · updated{" "}
        {skill.updated}
      </div>
      <div className="skill-desc">{skill.desc}</div>
      <div className="skill-meta">
        {skill.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
        <Button
          variant="ghost"
          size="xs"
          href={skill.url}
          target="_blank"
          rel="noopener"
          className="skill-link-btn"
        >
          Open repo &rarr;
        </Button>
      </div>
    </div>
  );
}
