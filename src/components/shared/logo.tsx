import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <span className="text-xl font-bold">
        Input<span className="text-primary">Haven</span>
      </span>
    </Link>
  );
}
