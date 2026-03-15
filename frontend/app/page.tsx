"use client";
import { useRouter } from "next/navigation";

// Required if using Next.js App Router

export default function Home() {
  const router = useRouter();
  // Example handler functions
  const handleNavigation = (destination) => {
    router.push(destination);
  };

  return (
    <main className="min-h-screen bg-[#0a0c14] text-slate-200 p-4 md:p-8 font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center max-w-6xl mx-auto mb-20">
        <div className="text-2xl font-bold tracking-tighter text-blue-500">
          RESURGENCE
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => handleNavigation("/scoreboard")}
            className="hover:text-red-500 transition"
          >
            Scoreboard
          </button>
          <button
            onClick={() => handleNavigation("/login")}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Login
          </button>
          <button
            onClick={() => handleNavigation("/register")}
            className="px-5 py-2 bg-red-600 rounded-full hover:bg-red-700 transition shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-10 md:p-16 rounded-3xl shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-red-500">
            BREACH@TRIX
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            Resurgence marks the rise of a new generation of innovators in a
            world reshaped by intelligence, both human and artificial.
          </p>

          <button
            onClick={() => handleNavigation("/arena")}
            className="px-8 py-4 bg-blue-600 rounded-xl font-semibold hover:bg-blue-700 transition shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Enter the Cyber Arena
          </button>
        </div>
      </section>

      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/20 blur-[120px] rounded-full -z-10"></div>
    </main>
  );
}
