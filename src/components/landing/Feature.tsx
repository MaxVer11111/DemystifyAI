interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function Feature({ title, description, icon }: FeatureProps) {
  return (
    <div className="feature card-flat">
      <div className="feature-mark">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
