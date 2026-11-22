import Link from "next/link";

export function Logo({ href = "/", size = "md" }: { href?: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-9 w-9" : "h-7 w-7";
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="Kyro home">
      <span className={`relative grid ${box} place-items-center rounded-lg bg-iris-400 shadow-glow transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-[-8deg] group-hover:scale-105`}>
        <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="#0b0d14" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v16M18 4l-8 8 8 8" />
        </svg>
      </span>
      <span className={`font-display font-bold tracking-tight text-white ${size === "lg" ? "text-2xl" : "text-xl"}`}>Kyro</span>
    </Link>
  );
}
