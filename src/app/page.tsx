import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-bold">HOP</span>
        <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Sign in
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          DOT & IFTA compliance for owner-operators
        </h1>
        <p className="mt-4 max-w-lg text-lg text-gray-600">
          DVIR forms, IFTA fuel tax, driver files, and CSA monitoring — built for 1–5 truck operations. No enterprise bloat.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/login" className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            Get started free
          </Link>
        </div>
      </main>
    </div>
  );
}
