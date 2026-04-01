import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[0.34em] text-ember">Not found</p>
      <h1 className="mt-4 font-display text-6xl leading-none text-ink">That release is not in this MVP dataset.</h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-ink/65">
        The current build tracks a seeded list of major theatrical titles. Search again or jump back to the homepage.
      </p>
      <Link href="/" className="mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-white">
        Back home
      </Link>
    </div>
  );
}
