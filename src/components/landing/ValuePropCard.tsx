interface ValuePropCardProps {
  num: string;
  title: string;
  description: string;
}

export function ValuePropCard({ num, title, description }: ValuePropCardProps) {
  return (
    <div className="value-prop-card">
      <div className="prop-num">{num}</div>
      <h3>{title}</h3>
      <p className="lead" style={{ marginTop: 8, fontSize: 15 }}>
        {description}
      </p>
    </div>
  );
}
