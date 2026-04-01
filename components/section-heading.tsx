export function SectionHeading({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="mb-3 text-xs uppercase tracking-[0.34em] text-ember">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{title}</h2>
      {copy ? <p className="mt-3 text-base leading-7 text-ink/68">{copy}</p> : null}
    </div>
  );
}
