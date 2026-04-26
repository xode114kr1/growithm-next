export default async function Header() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold text-teal-900 italic font-h1-editorial">
          Growithm
        </span>
        <div className="hidden md:flex gap-6">
          <a
            className="font-serif text-sm tracking-tight text-teal-900 font-semibold border-b-2 border-teal-900"
            href=""
          >
            Home
          </a>
          <a
            className="font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
            href="/problem"
          >
            Problem
          </a>
          <a
            className="font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
            href="study"
          >
            Study
          </a>
          <a
            className="font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors"
            href="friend"
          >
            Friend
          </a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 font-serif text-sm tracking-tight text-slate-500 hover:text-teal-800 transition-colors">
          Log In
        </button>
      </div>
    </nav>
  );
}
