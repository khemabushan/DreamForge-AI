interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-glass-border px-6 py-6 md:px-10">
      <div>
        <h1 className="font-display text-2xl text-mist">{title}</h1>
        {subtitle && <p className="mt-1 font-body text-sm text-mist-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
