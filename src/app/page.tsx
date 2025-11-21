import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        
        {/* Logo Section */}
        <div className="flex items-center gap-4">
           {/* We can keep the Next.js logo for now, or remove it later */}
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          {/* MAIN TITLE */}
          <h1 className="max-w-md text-4xl font-bold leading-10 tracking-tight text-black dark:text-zinc-50">
            Smart Maintenance System
          </h1>
          
          {/* DESCRIPTION */}
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Streamline your facility management, track repairs, and manage work orders efficiently in one place.
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[158px]"
          >
            Login
          </button>
          
          <button
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
          >
            View Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}