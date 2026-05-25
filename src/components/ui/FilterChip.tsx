interface FilterChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export function FilterChip({ children, active = false, onClick }: FilterChipProps) {
  return (
    <button className={`filter-chip${active ? " active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
