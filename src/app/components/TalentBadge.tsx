interface TalentBadgeProps {
  icon: string;
  label: string;
  gradient?: string;
}

export default function TalentBadge({ icon, label, gradient = "from-primary to-accent" }: TalentBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white text-sm`}>
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}
