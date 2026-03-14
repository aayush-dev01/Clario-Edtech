export function PageShell({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen overflow-hidden px-6 py-8 md:px-10 ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,229,255,0.12),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(111,124,255,0.16),_transparent_28%),linear-gradient(180deg,_rgba(6,16,30,0.25),_rgba(6,16,30,0.92))]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_88%)]" />
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

export function PageHero({ eyebrow, title, description, actions, aside }) {
  return (
    <section className="grid gap-8 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="max-w-3xl">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/68 backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_18px_rgba(0,229,255,0.8)]" />
            {eyebrow}
          </div>
        )}
        <h1 className="mt-6 text-4xl font-bold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">{description}</p>}
        {actions && <div className="mt-8 flex flex-wrap gap-4">{actions}</div>}
      </div>
      {aside ? <div>{aside}</div> : null}
    </section>
  );
}

export function GlassPanel({ children, className = '' }) {
  return (
    <div className={`rounded-[1.8rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(4,10,20,0.24)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ children, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/8 text-white/72',
    cyan: 'border-cyan/20 bg-cyan/12 text-cyan',
    teal: 'border-teal/20 bg-teal/12 text-teal',
    coral: 'border-coral/20 bg-coral/12 text-coral',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${tones[tone] || tones.default}`}>
      {children}
    </span>
  );
}

export function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-[1.1rem] bg-cyan px-5 py-3 font-semibold text-navy shadow-[0_18px_50px_rgba(0,229,255,0.2)] transition hover:-translate-y-0.5 hover:bg-[#8df3ff] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-[1.1rem] border border-white/14 bg-white/6 px-5 py-3 font-medium text-white/86 backdrop-blur-xl transition hover:border-cyan/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
