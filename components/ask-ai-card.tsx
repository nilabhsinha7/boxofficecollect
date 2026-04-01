export function AskAiCard({
  title = "Ask AI using structured box office data",
  prompt = "Why is Avatar: Fire and Ash holding better internationally than domestically?"
}: {
  title?: string;
  prompt?: string;
}) {
  return (
    <div className="rounded-[30px] border border-[#1a304d] bg-[#10233a] p-6 text-white shadow-panel sm:p-7">
      <p className="text-xs uppercase tracking-[0.32em] text-gold">Ask Box Office AI</p>
      <h3 className="mt-4 max-w-xl font-display text-3xl leading-tight sm:text-4xl">{title}</h3>
      <div className="mt-6 rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-white/45">Example prompt</p>
        <p className="mt-3 text-base leading-7 text-white/88 sm:text-lg">{prompt}</p>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/62">
        MVP note: this box is wired as a product placeholder for the future OpenAI summary endpoint and structured database queries.
      </p>
    </div>
  );
}
