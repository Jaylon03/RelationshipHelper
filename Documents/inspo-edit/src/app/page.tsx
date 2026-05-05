import Link from "next/link";

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
          Valid<span className="text-blue-600">ly</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition">How it works</a>
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition">What you get</a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition font-medium"
          >
            Log in
          </Link>
          <Link
            href="/login?tab=signup"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            Start Validating Free
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="bg-white pt-20 pb-8 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 text-blue-600 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Powered by real Reddit data
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Validate your idea with{" "}
            <span className="text-blue-600">real Reddit data.</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed mb-10">
            Type your startup idea. We find the communities already talking about the problem, surface the top pain points, and show you exactly where your market exists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?tab=signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/25 text-base"
            >
              Start Validating Free →
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold rounded-xl transition text-base bg-white"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-gray-400 mt-4">Free to start · No credit card required</p>
        </div>

        {/* Results preview mockup */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-[#08080f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-gray-900/40">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-[#111118]">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 max-w-sm mx-auto">
                <div className="bg-white/10 rounded-md px-3 py-1 text-xs text-gray-400 text-center font-mono">
                  validly.app/results/your-scan
                </div>
              </div>
            </div>
            <div className="p-6">
              {/* Idea section */}
              <div className="bg-gradient-to-r from-blue-900/40 to-transparent rounded-xl p-5 mb-4">
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-2">Scanning idea</p>
                <p className="text-white font-bold text-lg leading-snug">
                  A tool that helps indie developers find beta testers for their apps before launch.
                </p>
              </div>
              {/* Top pain point */}
              <div className="bg-[#111118] border border-blue-500/30 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">92</span>
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">r/SideProject</span>
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">✓ Validates</span>
                    </div>
                    <p className="text-white font-semibold text-sm">#1 — No way to find real users who will give honest feedback</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    "\"I launched to ProductHunt and got 200 upvotes but zero paying users — the feedback was surface level\"",
                    "\"Beta testers from my network all know me so they hold back criticism\"",
                  ].map((quote, i) => (
                    <div key={i} className="pl-3 border-l border-blue-500/30 text-gray-400 text-xs italic">{quote}</div>
                  ))}
                </div>
              </div>
              {/* Bottom row */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-400 font-semibold mb-0.5">Scanned subreddits</p>
                  <p className="text-white text-sm font-medium">r/SideProject · r/Entrepreneur · r/startups · r/indiehackers</p>
                </div>
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-4">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute -right-4 top-16 bg-white border border-gray-100 rounded-xl shadow-xl p-4 w-52 hidden lg:block">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Scan results</p>
            <div className="space-y-2.5">
              {[
                { label: "Pain points found", value: "8 identified", dot: "bg-blue-600" },
                { label: "Top signal", value: "Validates idea", dot: "bg-green-400" },
                { label: "Reddit posts", value: "143 analyzed", dot: "bg-amber-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-xs font-medium text-gray-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "5K+", label: "Ideas validated" },
    { value: "500K+", label: "Reddit posts analyzed" },
    { value: "8 secs", label: "Avg. scan time" },
    { value: "4.9 / 5", label: "Average rating" },
  ];
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">How it works</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">From idea to market evidence in 30 seconds</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">No surveys. No guessing. Just real conversations from people who already have the problem.</p>
        </div>

        {/* Step 1 */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">01</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-600/10 px-3 py-1 rounded-full">Idea input</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Describe your startup idea</h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              Write your idea in one sentence. Be specific about the problem you&apos;re solving and who you&apos;re solving it for. The more specific, the better the results.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Your idea</span>
              <span className="text-xs text-blue-600 bg-blue-600/10 px-2 py-1 rounded-full font-medium">1 sentence</span>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  &quot;A platform that connects indie developers with beta testers who give structured, actionable feedback before launch.&quot;
                </p>
              </div>
              <div className="flex justify-end">
                <div className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
                  Find My Market →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="md:order-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">02</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-600/10 px-3 py-1 rounded-full">Reddit scan</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">We scan Reddit for real evidence</h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              Validly generates targeted search queries and we scan the most relevant subreddits surfacing real conversations where people describe the exact problem your idea solves.
            </p>
          </div>
          <div className="md:order-1 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white">
              <span className="text-sm font-medium text-gray-700">Scanning Reddit communities...</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: "Generating search queries", pct: 100, done: true },
                { label: "Scanning r/SideProject (143 posts)", pct: 100, done: true },
                { label: "Scanning r/Entrepreneur (89 posts)", pct: 100, done: true },
                { label: "Analyzing pain points with AI", pct: 65, done: false },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={item.done ? "text-gray-400" : "text-gray-700 font-medium"}>{item.label}</span>
                    <span className={item.done ? "text-green-500 font-medium" : "text-blue-600 font-medium"}>
                      {item.done ? "Done" : `${item.pct}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.done ? "bg-green-400" : "bg-blue-600"}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center">03</span>
              <span className="text-xs font-semibold text-blue-600 bg-blue-600/10 px-3 py-1 rounded-full">Pain point results</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get ranked pain points with evidence</h3>
            <p className="text-gray-500 text-lg leading-relaxed">
              See the top pain points ranked by relevance score, backed by real Reddit quotes as evidence. Every finding tells you whether it validates or challenges your idea.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Results ready</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">8 pain points ✓</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { rank: 1, score: 92, signal: "✓ Validates", title: "No way to find unbiased beta testers", sub: "r/SideProject" },
                { rank: 2, score: 87, signal: "✓ Validates", title: "Feedback from friends isn't actionable", sub: "r/startups" },
                { rank: 3, score: 74, signal: "⚠ Challenges", title: "Developers want free testers, not paid", sub: "r/Entrepreneur" },
              ].map((item) => (
                <div key={item.rank} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-3.5 py-2.5">
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{item.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.score >= 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{item.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AISection() {
  return (
    <section className="py-24 px-6 bg-[#0f0a1e]">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Powered by AI + Reddit</span>
          <h2 className="text-4xl font-bold text-white mt-3 mb-6">
            Market research that actually tells the truth
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Validly generates the exact search queries real users would type when describing your problem — then scans Reddit to find where those conversations are happening right now.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: "Real user language", body: "Queries are written the way frustrated users talk, not how founders pitch." },
              { title: "Live Reddit data", body: "Every scan pulls fresh posts from the past month, not cached or synthetic data." },
              { title: "Ranked evidence", body: "Pain points scored by relevance so you know what actually matters most." },
              { title: "Validates or challenges", body: "Each finding tells you whether your idea has real traction or faces resistance." },
            ].map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h4 className="text-white font-semibold text-sm mb-1.5">{item.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1030] border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs text-gray-400 font-mono">scan_results.json</span>
          </div>
          <div className="p-5 font-mono text-xs leading-loose">
            <span className="text-gray-500">{"{"}</span>
            {[
              { key: "idea", val: '"Beta testing platform for indie devs"', valClass: "text-green-400" },
              { key: "subredditsScanned", val: '"8 subreddits"', valClass: "text-green-400" },
              { key: "postsAnalyzed", val: "143", valClass: "text-amber-400" },
              { key: "topPainPoint", val: '"No unbiased tester source"', valClass: "text-blue-400" },
              { key: "topScore", val: "92", valClass: "text-green-400" },
              { key: "signal", val: '"validates"', valClass: "text-green-400" },
            ].map((line) => (
              <div key={line.key} className="pl-4">
                <span className="text-blue-300">&quot;{line.key}&quot;</span>
                <span className="text-gray-500">: </span>
                <span className={line.valClass}>{line.val}</span>
                <span className="text-gray-500">,</span>
              </div>
            ))}
            <span className="text-gray-500">{"}"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatYouGet() {
  const items = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Ranked pain points",
      body: "Up to 8 pain points ranked by relevance score (0–100) so you instantly know which problems are most prevalent in your target market.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      title: "Real Reddit evidence",
      body: "3–5 direct quotes from real Reddit users for each pain point. These are the exact words your future customers use to describe their frustration.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Validates or Challenges signal",
      body: "Each pain point tells you whether it validates your hypothesis or challenges it — so you can refine your idea before building anything.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Subreddit source tags",
      body: "See exactly which communities surfaced each pain point — so you know where your earliest customers are already gathering online.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: "AI Analysis per pain point",
      body: "Click any pain point for an instant AI breakdown: who specifically has this pain, how your idea could solve it, and how to monetize it.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      title: "Save the best findings",
      body: "Bookmark the most relevant pain points to a saved results list — accessible any time from your dashboard without re-running the scan.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">What you get</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Everything in your validation report</h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Not a list of assumptions. Real evidence from real communities who already have the problem you&apos;re solving.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.title}
              className="group bg-gray-50 hover:bg-white border border-gray-100 hover:border-blue-600/20 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-blue-600/5"
            >
              <div className="w-10 h-10 bg-blue-600/10 group-hover:bg-blue-600/15 text-blue-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                {item.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "3 scans per day",
      features: [
        "3 idea scans per day",
        "Up to 8 pain points per scan",
        "Real Reddit evidence",
        "Validates / Challenges signal",
        "Save up to 10 pain points",
        "AI Analysis per pain point",
      ],
      cta: "Start validating free →",
      highlight: false,
      href: "/login?tab=signup",
    },
    {
      name: "Pro",
      price: "$19",
      description: "Per month · Cancel anytime",
      features: [
        "Unlimited scans per day",
        "Save unlimited pain points",
        "Export results to PDF/CSV",
        "Priority scan speed",
        "Scan history forever",
        "Early access to new features",
      ],
      cta: "Get Pro →",
      highlight: true,
      badge: "Most popular",
      href: "/login?tab=signup",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Pricing</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Simple, honest pricing</h2>
          <p className="text-lg text-gray-500">Start free. Upgrade when you need more scans.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30 sm:-mt-4 sm:-mb-4"
                  : "bg-white border border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full border border-blue-600/20 shadow-sm whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                </div>
                <p className={`text-sm ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>{plan.description}</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}>
                    <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-blue-600"}`}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center px-6 py-3 rounded-xl font-semibold text-sm transition ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "border border-gray-200 hover:border-blue-600/40 text-gray-700 hover:text-blue-600"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    {
      quote: "I spent 3 weeks building a feature nobody wanted. With Validly I ran a scan first and found out the real pain was onboarding, not the feature itself. Saved me months of wasted work.",
      name: "Marcus D.",
      handle: "Indie developer · SaaS founder",
    },
    {
      quote: "The Reddit evidence is the best part. It's not AI-generated fluff — it's actual quotes from real people describing the exact problem I'm solving. Sent them straight to my investors.",
      name: "Priya S.",
      handle: "Founder · Pre-seed startup",
    },
    {
      quote: "I validated three different ideas in one afternoon. Two got weak signals, one lit up with pain points from multiple subreddits. That's the one I'm building.",
      name: "Jordan T.",
      handle: "Serial builder · Bootstrapped",
    },
    {
      quote: "The 'Challenges' signal saved me from a pivot I would have regretted. People on Reddit weren't complaining about what I thought — they had a completely different problem.",
      name: "Sam W.",
      handle: "Product manager turned founder",
    },
    {
      quote: "I used to spend a week doing manual Reddit research for each idea. Validly does it in 30 seconds and finds things I would have missed entirely.",
      name: "Alex R.",
      handle: "Startup studio operator",
    },
    {
      quote: "The AI Analysis breakdown per pain point is incredible. Target audience, solution angle, monetization — all in one click. My investor pitch got 3x sharper after using this.",
      name: "Chris M.",
      handle: "YC applicant · B2B SaaS",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Testimonials</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Real founders. Real validation.</h2>
          <p className="text-lg text-gray-500">What happens when you stop guessing and start scanning.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <div key={q.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed flex-1 mb-6">&ldquo;{q.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600/15 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                  {q.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{q.name}</p>
                  <p className="text-xs text-gray-400">{q.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-6 bg-blue-600">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          Your market is already on Reddit.
        </h2>
        <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
          Stop guessing whether people want your idea. Scan Reddit in 30 seconds and find out where the demand already lives.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?tab=signup"
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl transition hover:bg-blue-50 text-base shadow-lg"
          >
            Start Validating Free →
          </Link>
        </div>
        <p className="text-blue-300 text-sm mt-4">Free · 3 scans/day · No credit card required</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="font-bold text-xl text-white mb-3">
              Valid<span className="text-blue-400">ly</span>
            </div>
            <p className="text-sm leading-relaxed">
              Validate startup ideas with real Reddit data. Find pain points before you build.
            </p>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Product</p>
            <ul className="space-y-2.5">
              {["How it works", "What you get", "Pricing"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition">{item}</a>
                </li>
              ))}
              <li>
                <Link href="/scan" className="text-sm hover:text-white transition">Start a scan</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Company</p>
            <ul className="space-y-2.5">
              {["About", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold text-sm mb-4">Legal</p>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm hover:text-white transition">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Validly. All rights reserved.</p>
          <Link href="/login?tab=signup" className="text-sm text-blue-400 hover:text-white transition">
            Start validating free →
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <AISection />
      <WhatYouGet />
      <Pricing />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </main>
  );
}
