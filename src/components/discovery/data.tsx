export interface Person {
  initials: string;
  name: string;
  role: string;
  bio: string;
  tags: string[];
  color: string;
  fg: string;
  category: string;
  handle: string;
}

export interface Skill {
  title: string;
  author: string;
  stars: string;
  desc: string;
  tags: string[];
  url: string;
  updated: string;
}

export interface LibraryItem {
  type: string;
  title: string;
  creator: string;
  desc: string;
  tags: string[];
  level: "Beginner" | "Intermediate";
  category: string;
  url: string;
}

export interface FeedArticle {
  source_name: string;
  source_category: string;
  title: string;
  author: string | null;
  url: string;
  published_at: string | null;
  ai_summary: string;
  tags: string;
  raw_content: string;
}

export interface AtAGlance {
  date: string;
  title: string;
  themes: string[];
  top_posts: { name: string; desc: string }[];
  created_at: string;
}

export interface FeedPost {
  initials: string;
  name: string;
  handle: string;
  content: string;
  time: string;
  likes: string;
  reposts: string;
  score: string;
  bg: string;
  fg: string;
  images?: string[];
  url?: string;
  category?: string;
}

export interface XPost {
  id: string;
  author: string;
  handle: string;
  text: string;
  images: string[];
  url: string;
  likes: number;
  reposts: number;
  created_at: string;
}

export const CATEGORY_EMOJI: Record<string, string> = {
  "AI & Machine Learning": "🧠",
  "AI & Tech": "🤖",
  "Cybersecurity & Privacy": "🔒",
  "Systems Programming & Low-Level": "⚙️",
  "Web Development & Frontend": "🌐",
  "Software Engineering & Career": "💻",
  "DevOps, Infrastructure & SysAdmin": "🚀",
  "Hardware & Electronics": "🔧",
  "Vintage & Retro Computing": "📼",
  "Math, Science & Research": "🔬",
  "Tech Culture & Commentary": "🗣️",
  "Startups, Business & Investing": "💡",
  "Gaming & Interactive Media History": "🎮",
  "Writing, Communication & Personal": "✍️",
  "Ideas, Essays & Big Thinking": "💭",
  "Tech News You Actually Need to Know": "📰",
  "Society, Industry & Economics": "🏛️",
  "Writing & Personal": "📝",
};

export const PEOPLE: Person[] = [
  {
    initials: "AK", name: "Andrej Karpathy", role: "AI Researcher & Educator",
    bio: 'Best technical educator in AI. Makes complex concepts genuinely accessible — his "Zero to Hero" series is the gold standard.',
    tags: ["AI Education", "Research"], color: "oklch(75% 0.06 220)", fg: "oklch(35% 0.06 220)",
    category: "AI Educators & Researchers", handle: "@karpathy",
  },
  {
    initials: "SX", name: "Swyx", role: "Leading Voice in AI Engineering",
    bio: "Leading voice in the AI Engineers community. Bridges the gap between research and production engineering.",
    tags: ["AI Engineering", "Community"], color: "oklch(72% 0.07 260)", fg: "oklch(32% 0.07 260)",
    category: "AI Educators & Researchers", handle: "@swyx",
  },
  {
    initials: "SJ", name: "Steven Johnson", role: "Author; Soul Behind NotebookLM",
    bio: "Author of 13 books on innovation. The creative mind behind NotebookLM — makes AI feel like a thinking partner.",
    tags: ["NotebookLM", "Creativity"], color: "oklch(75% 0.06 160)", fg: "oklch(35% 0.06 160)",
    category: "AI Educators & Researchers", handle: "@stevenbjohnson",
  },
  {
    initials: "KW", name: "Kevin Weil", role: "Head of Product @ OpenAI",
    bio: "Leads product at OpenAI. First-hand perspective on how frontier AI ships to millions of users.",
    tags: ["OpenAI", "Product"], color: "oklch(70% 0.08 30)", fg: "oklch(30% 0.08 30)",
    category: "OpenAI", handle: "@kevinweil",
  },
  {
    initials: "JW", name: "Josh Woodward", role: "VP of Gemini & Google Labs",
    bio: "Runs Gemini product and Google Labs — the experimental arm shipping AI to billions through Google products.",
    tags: ["Google", "Gemini"], color: "oklch(68% 0.08 40)", fg: "oklch(28% 0.08 40)",
    category: "Google / Gemini / DeepMind", handle: "@joshwoodward",
  },
  {
    initials: "MG", name: "Madhu Guru", role: "Product Leader @ Google Gemini",
    bio: "Product leader shaping Google Gemini. Deep insight into how large-scale AI products get built and adopted.",
    tags: ["Google", "Gemini"], color: "oklch(70% 0.07 50)", fg: "oklch(30% 0.07 50)",
    category: "Google / Gemini / DeepMind", handle: "@realmadhuguru",
  },
  {
    initials: "GL", name: "Google Labs", role: "Google AI Tools & Experiments",
    bio: "Google's home for AI tools and experiments. Where NotebookLM, Gemini features, and new AI experiments launch first.",
    tags: ["Google", "Experiments"], color: "oklch(65% 0.08 60)", fg: "oklch(25% 0.08 60)",
    category: "Google / Gemini / DeepMind", handle: "@GoogleLabs",
  },
  {
    initials: "LR", name: "Lenny Rachitsky", role: "Product & Growth Advisor",
    bio: "The best product and growth thinking in tech, now applied to the AI era. His newsletter and podcast shape how product teams work.",
    tags: ["Product", "Growth"], color: "oklch(72% 0.07 50)", fg: "oklch(30% 0.07 50)",
    category: "Product & Startup Leaders", handle: "@lennysan",
  },
  {
    initials: "PY", name: "Peter Yang", role: "Product Tactics & Productivity",
    bio: "Writes the clearest product tactics newsletter in tech. Focused on the craft of building — not the hype.",
    tags: ["Product", "Writing"], color: "oklch(70% 0.08 180)", fg: "oklch(30% 0.08 180)",
    category: "Product & Startup Leaders", handle: "@petergyang",
  },
  {
    initials: "NY", name: "Nan Yu", role: "Head of Product @ Linear",
    bio: "Leads product at Linear — the gold standard for how software tools should feel. Shapes how thousands of teams build.",
    tags: ["Product", "Design"], color: "oklch(72% 0.06 250)", fg: "oklch(32% 0.06 250)",
    category: "Product & Startup Leaders", handle: "@thenanyu",
  },
  {
    initials: "RM", name: "Raiza Martin", role: "Cofounder of Huxe; Former PM of NotebookLM",
    bio: "Former PM of NotebookLM, now building Huxe. Understands how AI changes the creative process at a fundamental level.",
    tags: ["Product", "AI UX"], color: "oklch(68% 0.09 320)", fg: "oklch(28% 0.09 320)",
    category: "Product & Startup Leaders", handle: "@raizamrtn",
  },
  {
    initials: "RL", name: "Ryo Lu", role: "Head of Design @ Cursor",
    bio: "Leads design at Cursor — the AI code editor that changed how developers work. Shapes the frontier of AI-native UX.",
    tags: ["Design", "Developer Tools"], color: "oklch(70% 0.08 270)", fg: "oklch(30% 0.08 270)",
    category: "Product & Startup Leaders", handle: "@ryolu_",
  },
  {
    initials: "AA", name: "Amanda Askell", role: "AI Personality & Character Expert @ Anthropic",
    bio: 'Expert on AI personality and character. Her work on Claude\'s "character training" is the deepest thinking on how AI should feel to talk to.',
    tags: ["Anthropic", "AI Character"], color: "oklch(70% 0.1 280)", fg: "oklch(30% 0.1 280)",
    category: "Anthropic / Claude", handle: "@amandaaskell",
  },
  {
    initials: "BC", name: "Boris Cherny", role: "Creator of Claude Code",
    bio: "Created Claude Code. Deeply thoughtful about developer tools, agent architectures, and making AI actually useful for real work.",
    tags: ["Claude Code", "DevTools"], color: "oklch(68% 0.09 190)", fg: "oklch(28% 0.09 190)",
    category: "Anthropic / Claude", handle: "@bcherny",
  },
  {
    initials: "CW", name: "Cat Wu", role: "Claude Code PM",
    bio: "Product manager for Claude Code. Shapes how one of the most-used AI coding tools evolves — grounded in real developer workflows.",
    tags: ["Claude Code", "Product"], color: "oklch(72% 0.07 310)", fg: "oklch(32% 0.07 310)",
    category: "Anthropic / Claude", handle: "@_catwu",
  },
  {
    initials: "TH", name: "Thariq", role: "Claude Code Team",
    bio: "On the Claude Code team. Has firsthand insight into what makes agentic coding tools effective and where they break.",
    tags: ["Claude Code", "Engineering"], color: "oklch(75% 0.05 200)", fg: "oklch(35% 0.05 200)",
    category: "Anthropic / Claude", handle: "@trq212",
  },
  {
    initials: "AL", name: "Alex Albert", role: "Claude Relations @ Anthropic",
    bio: "The human bridge between Anthropic and the developer community. If Claude does something surprising, Alex probably has the context.",
    tags: ["Anthropic", "Community"], color: "oklch(68% 0.08 350)", fg: "oklch(28% 0.08 350)",
    category: "Anthropic / Claude", handle: "@alexalbert__",
  },
  {
    initials: "CD", name: "Claude Developers", role: "Official Claude Dev Relations",
    bio: "Official account for Claude developer updates. Product news, API changes, and tips for building with Claude.",
    tags: ["Claude", "Developer Tools"], color: "oklch(65% 0.09 30)", fg: "#fff",
    category: "Anthropic / Claude", handle: "@ClaudeDevs",
  },
  {
    initials: "MW", name: "Mckay Wrigley", role: "Vibe-Coding Educator",
    bio: "The best place to learn vibe-coding. Teaches non-developers how to build software by talking to AI — no CS degree required.",
    tags: ["Vibe Coding", "Education"], color: "oklch(72% 0.08 120)", fg: "oklch(32% 0.08 120)",
    category: "Vibe Coding / Developers", handle: "@mckaywrigley",
  },
  {
    initials: "RB", name: "Riley Brown", role: "Vibe-Coding Educator",
    bio: 'Teaches vibe-coding with clarity and zero pretension. If you want to go from "I can\'t code" to shipping AI apps, start here.',
    tags: ["Vibe Coding", "Education"], color: "oklch(70% 0.09 140)", fg: "oklch(30% 0.09 140)",
    category: "Vibe Coding / Developers", handle: "@rileybrown",
  },
  {
    initials: "HH", name: "Hamel Husain", role: "Evals Expert",
    bio: "The authority on AI evaluation. If you want to know whether an AI system actually works — not just whether it looks good — Hamel has the methodology.",
    tags: ["Evals", "ML Engineering"], color: "oklch(68% 0.08 80)", fg: "oklch(28% 0.08 80)",
    category: "Vibe Coding / Developers", handle: "@hamelhusain",
  },
  {
    initials: "GI", name: "Greg Isenberg", role: "Startup Ideas & AI Company Building",
    bio: "Sharpest thinking on startup ideas and AI-native company building. Understands where AI creates new business models.",
    tags: ["Startups", "AI Business"], color: "oklch(75% 0.06 40)", fg: "oklch(35% 0.06 40)",
    category: "Founders, CEOs & Investors", handle: "@gregisenberg",
  },
  {
    initials: "GM", name: "George Mack", role: "High-Agency Thinking",
    bio: "Writes about being high-agency — the single most important trait in the AI era. If you want to stop scrolling and start doing, follow George.",
    tags: ["Mindset", "Agency"], color: "oklch(72% 0.05 90)", fg: "oklch(30% 0.05 90)",
    category: "Founders, CEOs & Investors", handle: "@george__mack",
  },
  {
    initials: "AM", name: "Amjad Masad", role: "CEO of Replit",
    bio: "CEO of Replit — making programming accessible to everyone. His vision of AI-native development is playing out in real time.",
    tags: ["Replit", "AI Development"], color: "oklch(65% 0.09 250)", fg: "oklch(25% 0.09 250)",
    category: "Founders, CEOs & Investors", handle: "@amasad",
  },
  {
    initials: "GR", name: "Guillermo Rauch", role: "CEO of Vercel",
    bio: "CEO of Vercel — the platform that powers the modern web. Sees the full picture of how AI changes frontend development.",
    tags: ["Vercel", "Frontend"], color: "oklch(70% 0.08 0)", fg: "oklch(30% 0.08 0)",
    category: "Founders, CEOs & Investors", handle: "@rauchg",
  },
  {
    initials: "AL2", name: "Aaron Levie", role: "CEO of Box",
    bio: "CEO of Box — one of the sharpest thinkers on enterprise AI adoption. His threadstorms on where AI is actually landing in big companies are required reading.",
    tags: ["Enterprise AI", "SaaS"], color: "oklch(68% 0.1 220)", fg: "oklch(28% 0.1 220)",
    category: "Founders, CEOs & Investors", handle: "@levie",
  },
  {
    initials: "GT", name: "Garry Tan", role: "President of Y Combinator",
    bio: "President of YC — sees more AI startups than almost anyone. His takes on what's working and what's hype are grounded in actual deal flow.",
    tags: ["YC", "Startups"], color: "oklch(70% 0.09 30)", fg: "oklch(30% 0.09 30)",
    category: "Founders, CEOs & Investors", handle: "@garrytan",
  },
  {
    initials: "JM", name: "Justine Moore", role: "Consumer AI & AI Video Trends",
    bio: "The best analyst covering consumer AI and AI video. Spots trends before they become obvious.",
    tags: ["Consumer AI", "Video"], color: "oklch(72% 0.08 330)", fg: "oklch(32% 0.08 330)",
    category: "Founders, CEOs & Investors", handle: "@venturetwins",
  },
  {
    initials: "MT", name: "Matt Turck", role: "Venture Capitalist",
    bio: "Top VC tracking the AI and data landscape. His annual MAD (ML/AI/Data) landscape is the reference map of the AI ecosystem.",
    tags: ["VC", "AI Landscape"], color: "oklch(68% 0.07 270)", fg: "oklch(28% 0.07 270)",
    category: "Founders, CEOs & Investors", handle: "@mattturck",
  },
  {
    initials: "JZ", name: "Julie Zhuo", role: "Founder of Sundial",
    bio: "Former VP of Design at Facebook, now building Sundial. Writes the clearest thinking on product design and leadership in tech.",
    tags: ["Design", "Leadership"], color: "oklch(70% 0.08 310)", fg: "oklch(30% 0.08 310)",
    category: "Founders, CEOs & Investors", handle: "@joulee",
  },
  {
    initials: "LM", name: "Lulu Cheng Meservey", role: "Top Voice in Comms & GTM",
    bio: "The sharpest thinker on communications and go-to-market strategy in tech. If you're building anything and need people to hear about it, Lulu is the playbook.",
    tags: ["GTM", "Communications"], color: "oklch(72% 0.07 10)", fg: "oklch(30% 0.07 10)",
    category: "Founders, CEOs & Investors", handle: "@lulumeservey",
  },
  {
    initials: "OA", name: "OpenAI", role: "AI Research & Products",
    bio: "Frontier AI research lab and creator of ChatGPT and GPT models. Ships cutting-edge AI to hundreds of millions of users worldwide.",
    tags: ["AI Lab", "Products"], color: "oklch(55% 0.12 160)", fg: "#fff",
    category: "OpenAI", handle: "@OpenAI",
  },
  {
    initials: "AN", name: "Anthropic", role: "AI Research & Safety",
    bio: "AI research company focused on safety and reliability. Creators of Claude — the most thoughtful and helpful AI assistant.",
    tags: ["AI Lab", "Safety"], color: "oklch(55% 0.1 30)", fg: "#fff",
    category: "Anthropic / Claude", handle: "@AnthropicAI",
  },
  {
    initials: "GD", name: "Google DeepMind", role: "AI Research Lab",
    bio: "Google's premier AI research lab. Behind Gemini, AlphaFold, and breakthroughs that push the frontier of what AI can do.",
    tags: ["Research", "Gemini"], color: "oklch(50% 0.14 255)", fg: "#fff",
    category: "Google / Gemini / DeepMind", handle: "@GoogleDeepMind",
  },
  {
    initials: "DS", name: "DeepSeek", role: "Open-Source AI Lab",
    bio: "Open-source AI research lab releasing frontier models. Proving that cutting-edge AI doesn't require closed-source or billion-dollar budgets.",
    tags: ["Open Source", "Research"], color: "oklch(50% 0.12 240)", fg: "#fff",
    category: "AI Educators & Researchers", handle: "@deepseek_ai",
  },
];

export const SKILLS: Skill[] = [
  {
    title: "superpowers", author: "obra", stars: "205k",
    desc: "Agentic skills framework & software development methodology — the system that teaches agents how to work like senior engineers, not just code generators.",
    tags: ["Agent Skills", "Framework"], url: "https://github.com/obra/superpowers", updated: "May 2026",
  },
  {
    title: "ECC", author: "affaan-m", stars: "190k",
    desc: "Agent harness optimization system with skills, memory, security, and research workflows. The control plane for running capable, safe, multi-step agent tasks.",
    tags: ["Agent Harness", "Infrastructure"], url: "https://github.com/affaan-m/ECC", updated: "May 2026",
  },
  {
    title: "andrej-karpathy-skills", author: "multica-ai", stars: "152k",
    desc: "Claude Code behavior improvements inspired by Andrej Karpathy's observations on LLM coding patterns — less over-engineering, more surgical edits.",
    tags: ["Agent Skills", "Code Quality"], url: "https://github.com/multica-ai/andrej-karpathy-skills", updated: "May 2026",
  },
  {
    title: "skills", author: "anthropics", stars: "140k",
    desc: "Public repository for Agent Skills — the official collection of reusable skill definitions that extend what Claude Code and other agents can do.",
    tags: ["Agent Skills", "Official"], url: "https://github.com/anthropics/skills", updated: "May 2026",
  },
  {
    title: "30-seconds-of-code", author: "Chalarangelo", stars: "128k",
    desc: "Coding articles and snippets to improve development skills — bite-sized, searchable, and continuously updated across JavaScript, Python, CSS, and more.",
    tags: ["Learning", "Snippets"], url: "https://github.com/Chalarangelo/30-seconds-of-code", updated: "May 2026",
  },
  {
    title: "skills", author: "mattpocock", stars: "103k",
    desc: "Collection of Claude Code skills from Matt Pocock's personal setup — TypeScript-heavy, opinionated, and battle-tested on real projects.",
    tags: ["Agent Skills", "TypeScript"], url: "https://github.com/mattpocock/skills", updated: "May 2026",
  },
  {
    title: "app-ideas", author: "florinpop17", stars: "94.2k",
    desc: "Application ideas for improving coding skills — tiered by difficulty, each with a spec, user stories, and suggested tech stack. Build your way up.",
    tags: ["Learning", "Projects"], url: "https://github.com/florinpop17/app-ideas", updated: "May 2026",
  },
  {
    title: "ui-ux-pro-max-skill", author: "nextlevelbuilder", stars: "82.3k",
    desc: "AI skill for professional UI/UX design intelligence — teaches agents how to think like designers, not just layout engines.",
    tags: ["Agent Skills", "Design"], url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill", updated: "May 2026",
  },
  {
    title: "deer-flow", author: "bytedance", stars: "69.4k",
    desc: "Open-source SuperAgent framework with tools, memory, and skills — ByteDance's take on building agents that can plan, execute, and learn over long horizons.",
    tags: ["Agent Framework", "Enterprise"], url: "https://github.com/bytedance/deer-flow", updated: "May 2026",
  },
  {
    title: "caveman", author: "JuliusBrussee", stars: "64.3k",
    desc: "Claude Code skill focused on reducing token usage ~75% by dropping filler while keeping full technical accuracy — ultra-compressed communication mode.",
    tags: ["Agent Skills", "Efficiency"], url: "https://github.com/JuliusBrussee/caveman", updated: "May 2026",
  },
];

export const LIBRARY: LibraryItem[] = [
  {
    type: "🎙", title: "Latent Space", creator: "swyx & Alessio",
    desc: "The podcast by and for AI engineers. Deep technical interviews with the people building the models and tools — from OpenAI researchers to open-source innovators.",
    tags: ["Podcast", "Technical"], level: "Intermediate", category: "General AI", url: "#",
  },
  {
    type: "🎙", title: "AI & I", creator: "Dan Shipper",
    desc: "How top people use AI to think, create, and relate. Not about the technology — about how AI changes the way we work and make things.",
    tags: ["Podcast", "Creative"], level: "Beginner", category: "General AI", url: "#",
  },
  {
    type: "🎙", title: "The AI Daily Brief", creator: "Nathaniel Whittemore",
    desc: "AI news with opinion and summaries. Daily 10-minute briefings — the highest-signal, lowest-time-cost way to stay current.",
    tags: ["Podcast", "News"], level: "Beginner", category: "General AI", url: "#",
  },
  {
    type: "🎙", title: "Training Data", creator: "Sequoia Capital",
    desc: "Conversations with AI builders and researchers at the frontier. Sequoia's access means guests you won't hear anywhere else.",
    tags: ["Podcast", "Interviews"], level: "Intermediate", category: "General AI", url: "#",
  },
  {
    type: "🎙", title: "No Priors", creator: "Elad Gil & Sarah Guo",
    desc: "Engineers, researchers, and founders on what's actually happening in AI — from two of the sharpest investors in the space.",
    tags: ["Podcast", "Interviews"], level: "Intermediate", category: "General AI", url: "#",
  },
  {
    type: "🎙", title: "Lenny's Podcast", creator: "Lenny Rachitsky",
    desc: "Product leaders and growth experts share what they've learned building and scaling products. Increasingly focused on how AI reshapes product work.",
    tags: ["Podcast", "Product"], level: "Beginner", category: "Product & Startups", url: "#",
  },
  {
    type: "🎙", title: "Behind the Craft", creator: "Peter Yang",
    desc: "Building products and creator businesses in the AI era. Tactical, specific, zero fluff.",
    tags: ["Podcast", "Product"], level: "Beginner", category: "Product & Startups", url: "#",
  },
  {
    type: "🎙", title: "Minus One", creator: "Various",
    desc: "Intimate conversations about building startups, products, and creative work — with an AI-native lens.",
    tags: ["Podcast", "Startups"], level: "Beginner", category: "Product & Startups", url: "#",
  },
  {
    type: "🎙", title: "Lightcone Podcast", creator: "Y Combinator",
    desc: "YC partners break down what's working in startups today. Heavy AI focus — most YC companies now are AI-native.",
    tags: ["Podcast", "Startups"], level: "Beginner", category: "Product & Startups", url: "#",
  },
  {
    type: "🎙", title: "Google DeepMind: The Podcast", creator: "Google DeepMind",
    desc: "Interviews with Google AI leaders on the research shaping the future. From AlphaFold to Gemini — straight from the source.",
    tags: ["Podcast", "Research"], level: "Intermediate", category: "AI Labs & Research", url: "#",
  },
  {
    type: "🎙", title: "TBPN", creator: "Various",
    desc: "Technology and business analysis at the intersection of AI, markets, and strategy. For understanding the business side of the AI shift.",
    tags: ["Podcast", "Business"], level: "Intermediate", category: "Technology", url: "#",
  },
];

export const FEED_POSTS: FeedPost[] = [
  {
    initials: "AK", name: "Andrej Karpathy", handle: "@karpathy",
    content: 'The best way to understand LLMs is still to build one from scratch. My updated "Zero to Hero" series now covers the full stack — tokenization through RLHF — with code you can run on a single GPU.',
    time: "2h ago", likes: "2.4K", reposts: "892", score: "9/10",
    bg: "oklch(75% 0.06 220)", fg: "oklch(35% 0.06 220)",
    category: "AI Educators & Researchers",
  },
  {
    initials: "KW", name: "Kevin Weil", handle: "@kevinweil",
    content: "Just shipped a major update to the OpenAI API — structured outputs are now the default for all models. If you've been using JSON mode, you can simplify your parsing logic dramatically. Docs updated.",
    time: "5h ago", likes: "1.8K", reposts: "456", score: "8/10",
    bg: "oklch(70% 0.08 30)", fg: "oklch(30% 0.08 30)",
    category: "OpenAI",
  },
  {
    initials: "SJ", name: "Steven Johnson", handle: "@stevenbjohnson",
    content: "NotebookLM just crossed a milestone I never expected: people are using it more for creative writing than for research. The AI-as-thinking-partner paradigm is real — and it's changing how ideas get developed.",
    time: "8h ago", likes: "3.1K", reposts: "1.2K", score: "9/10",
    bg: "oklch(75% 0.06 160)", fg: "oklch(35% 0.06 160)",
    category: "AI Educators & Researchers",
  },
  {
    initials: "AA", name: "Amanda Askell", handle: "@amandaaskell",
    content: 'Giving Claude a consistent "character" isn\'t about writing a long system prompt. It\'s about curating the training data so the model naturally defaults to the traits you want. We\'ve learned more from removing data than adding it.',
    time: "12h ago", likes: "4.2K", reposts: "1.8K", score: "10/10",
    bg: "oklch(70% 0.1 280)", fg: "oklch(30% 0.1 280)",
    category: "Anthropic / Claude",
  },
  {
    initials: "LR", name: "Lenny Rachitsky", handle: "@lennysan",
    content: "Interviewed a PM who shipped an AI feature that doubled retention. Their secret: they spent 3 weeks watching users struggle before writing a single line of code. The problem definition was the product.",
    time: "18h ago", likes: "2.7K", reposts: "634", score: "8/10",
    bg: "oklch(72% 0.07 50)", fg: "oklch(30% 0.07 50)",
    category: "Product & Startup Leaders",
  },
  {
    initials: "BC", name: "Boris Cherny", handle: "@bcherny",
    content: "Claude Code tip: the single biggest lever for agent performance is the CLAUDE.md file. Treat it like onboarding a new engineer — tell them the tech stack, conventions, and gotchas. A 50-line CLAUDE.md beats a 500-line system prompt.",
    time: "1d ago", likes: "5.1K", reposts: "2.3K", score: "10/10",
    bg: "oklch(68% 0.09 190)", fg: "oklch(28% 0.09 190)",
    category: "Anthropic / Claude",
  },
  {
    initials: "OA", name: "OpenAI", handle: "@OpenAI",
    content: "Introducing GPT-5: our most capable model yet. Native multimodality across text, images, audio, and video. Available today in the API and ChatGPT Pro, with enterprise rollout starting next week.",
    time: "4h ago", likes: "12.4K", reposts: "5.6K", score: "10/10",
    bg: "oklch(55% 0.12 160)", fg: "#fff",
    category: "OpenAI",
  },
  {
    initials: "AN", name: "Anthropic", handle: "@AnthropicAI",
    content: "Claude 4 Opus is here. Major advances in reasoning depth, code generation, and instruction following. Our internal evals show 40% fewer hallucinations on complex STEM tasks compared to the previous generation.",
    time: "7h ago", likes: "9.8K", reposts: "4.2K", score: "9/10",
    bg: "oklch(55% 0.1 30)", fg: "#fff",
    category: "Anthropic / Claude",
  },
  {
    initials: "GD", name: "Google DeepMind", handle: "@GoogleDeepMind",
    content: "Gemini 2.5 Pro now supports 2M token context windows natively. Upload entire codebases, research papers, or book series and reason across all of it simultaneously. Rolling out to Gemini Advanced users today.",
    time: "1d ago", likes: "8.7K", reposts: "3.4K", score: "9/10",
    bg: "oklch(50% 0.14 255)", fg: "#fff",
    category: "Google / Gemini / DeepMind",
  },
  {
    initials: "DS", name: "DeepSeek", handle: "@deepseek_ai",
    content: "DeepSeek-V4 released: fully open-source under MIT license. Matches proprietary frontier models on reasoning benchmarks while running on 60% less compute. Weights, code, and technical report available now on GitHub.",
    time: "1d ago", likes: "15.3K", reposts: "7.8K", score: "10/10",
    bg: "oklch(50% 0.12 240)", fg: "#fff",
    category: "AI Educators & Researchers",
  },
];

// Raw posts (pre-analysis format from scraper) — used as input for the
// DeepSeek analysis pipeline. Mirrors the RawPost interface in feed-analyzer.ts.
import type { RawPost } from "@/lib/feed-analyzer";
import type { ProcessedPost } from "@/lib/feed-analyzer";

export const RAW_POSTS: RawPost[] = [
  {
    id: "mock-1", author: "Andrej Karpathy", handle: "@karpathy",
    text: 'The best way to understand LLMs is still to build one from scratch. My updated "Zero to Hero" series now covers the full stack — tokenization through RLHF — with code you can run on a single GPU.',
    likes: 2400, reposts: 892, created_at: "2026-05-25T10:00:00Z",
  },
  {
    id: "mock-2", author: "Kevin Weil", handle: "@kevinweil",
    text: "Just shipped a major update to the OpenAI API — structured outputs are now the default for all models. If you've been using JSON mode, you can simplify your parsing logic dramatically. Docs updated.",
    likes: 1800, reposts: 456, created_at: "2026-05-25T07:00:00Z",
  },
  {
    id: "mock-3", author: "Steven Johnson", handle: "@stevenbjohnson",
    text: "NotebookLM just crossed a milestone I never expected: people are using it more for creative writing than for research. The AI-as-thinking-partner paradigm is real — and it's changing how ideas get developed.",
    likes: 3100, reposts: 1200, created_at: "2026-05-25T04:00:00Z",
  },
  {
    id: "mock-4", author: "Amanda Askell", handle: "@amandaaskell",
    text: 'Giving Claude a consistent "character" isn\'t about writing a long system prompt. It\'s about curating the training data so the model naturally defaults to the traits you want. We\'ve learned more from removing data than adding it.',
    likes: 4200, reposts: 1800, created_at: "2026-05-24T22:00:00Z",
  },
  {
    id: "mock-5", author: "Boris Cherny", handle: "@bcherny",
    text: "Claude Code tip: the single biggest lever for agent performance is the CLAUDE.md file. Treat it like onboarding a new engineer — tell them the tech stack, conventions, and gotchas. A 50-line CLAUDE.md beats a 500-line system prompt.",
    likes: 5100, reposts: 2300, created_at: "2026-05-24T18:00:00Z",
  },
  {
    id: "mock-6", author: "Lenny Rachitsky", handle: "@lennysan",
    text: "Interviewed a PM who shipped an AI feature that doubled retention. Their secret: they spent 3 weeks watching users struggle before writing a single line of code. The problem definition was the product.",
    likes: 2700, reposts: 634, created_at: "2026-05-24T14:00:00Z",
  },
  {
    id: "mock-7", author: "OpenAI", handle: "@OpenAI",
    text: "Introducing GPT-5: our most capable model yet. Native multimodality across text, images, audio, and video. Available today in the API and ChatGPT Pro, with enterprise rollout starting next week.",
    likes: 12400, reposts: 5600, created_at: "2026-05-25T12:00:00Z",
  },
  {
    id: "mock-8", author: "Anthropic", handle: "@AnthropicAI",
    text: "Claude 4 Opus is here. Major advances in reasoning depth, code generation, and instruction following. Our internal evals show 40% fewer hallucinations on complex STEM tasks compared to the previous generation.",
    likes: 9800, reposts: 4200, created_at: "2026-05-25T09:00:00Z",
  },
  {
    id: "mock-9", author: "Google DeepMind", handle: "@GoogleDeepMind",
    text: "Gemini 2.5 Pro now supports 2M token context windows natively. Upload entire codebases, research papers, or book series and reason across all of it simultaneously. Rolling out to Gemini Advanced users today.",
    likes: 8700, reposts: 3400, created_at: "2026-05-24T20:00:00Z",
  },
  {
    id: "mock-10", author: "DeepSeek", handle: "@deepseek_ai",
    text: "DeepSeek-V4 released: fully open-source under MIT license. Matches proprietary frontier models on reasoning benchmarks while running on 60% less compute. Weights, code, and technical report available now on GitHub.",
    likes: 15300, reposts: 7800, created_at: "2026-05-24T16:00:00Z",
  },
];

/**
 * Convert a ProcessedPost (output of runFeedPipeline) to a FeedPost
 * (the format the UI components expect).
 */
export function processedToFeedPost(p: ProcessedPost): FeedPost {
  const hoursAgo = Math.round(
    (Date.now() - new Date(p.posted_at).getTime()) / (1000 * 60 * 60)
  );
  const timeStr = hoursAgo < 1 ? "just now" : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.round(hoursAgo / 24)}d ago`;

  const colors: Record<string, { bg: string; fg: string }> = {
    "@karpathy":       { bg: "oklch(75% 0.06 220)", fg: "oklch(35% 0.06 220)" },
    "@kevinweil":      { bg: "oklch(70% 0.08 30)",  fg: "oklch(30% 0.08 30)" },
    "@stevenbjohnson": { bg: "oklch(75% 0.06 160)", fg: "oklch(35% 0.06 160)" },
    "@amandaaskell":   { bg: "oklch(70% 0.1 280)",  fg: "oklch(30% 0.1 280)" },
    "@bcherny":        { bg: "oklch(68% 0.09 190)", fg: "oklch(28% 0.09 190)" },
    "@lennysan":       { bg: "oklch(72% 0.07 50)",  fg: "oklch(30% 0.07 50)" },
    "@OpenAI":         { bg: "oklch(55% 0.12 160)", fg: "#fff" },
    "@AnthropicAI":    { bg: "oklch(55% 0.1 30)",   fg: "#fff" },
    "@GoogleDeepMind": { bg: "oklch(50% 0.14 255)", fg: "#fff" },
    "@deepseek_ai":    { bg: "oklch(50% 0.12 240)", fg: "#fff" },
  };

  const c = colors[p.handle] || { bg: "oklch(70% 0.06 200)", fg: "oklch(30% 0.06 200)" };

  const categoryMap: Record<string, string> = {};
  for (const person of PEOPLE) {
    if (!categoryMap[person.handle]) {
      categoryMap[person.handle] = person.category;
    }
  }

  return {
    initials: p.avatar,
    name: p.name,
    handle: p.handle,
    content: p.content,
    time: timeStr,
    likes: p.likes >= 1000 ? `${(p.likes / 1000).toFixed(1)}K` : String(p.likes),
    reposts: p.reposts >= 1000 ? `${(p.reposts / 1000).toFixed(1)}K` : String(p.reposts),
    score: `${p.score}/10`,
    bg: c.bg,
    fg: c.fg,
    category: categoryMap[p.handle],
  };
}

export function xPostToFeedPost(post: XPost, personMap: Record<string, Person>): FeedPost {
  const person = personMap[post.handle];
  const initials = person?.initials || post.author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const bg = person?.color || "oklch(70% 0.06 200)";
  const fg = person?.fg || "oklch(30% 0.06 200)";

  const hoursAgo = Math.round((Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60));
  const timeStr = hoursAgo < 1 ? "just now" : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.round(hoursAgo / 24)}d ago`;

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return {
    initials,
    name: post.author,
    handle: post.handle,
    content: post.text,
    time: timeStr,
    likes: formatCount(post.likes),
    reposts: formatCount(post.reposts),
    score: "",
    bg,
    fg,
    images: post.images,
    url: post.url,
    category: person?.category,
  };
}

export const FEED_SUMMARY = {
  title: "Today's feed spans frontier model releases, open-source breakthroughs, agent tooling, and product design — with DeepSeek's V4, OpenAI's GPT-5, and Anthropic's Claude 4 Opus dominating headlines alongside community voices.",
  themes: ["Model Releases", "Open Source AI", "Agent Tooling", "Product Design", "AI Ecosystem"],
  stats: [
    { num: "10", label: "Posts" },
    { num: "9.2", label: "Avg Score" },
    { num: "5", label: "Themes" },
  ],
  topPosts: [
    { name: "DeepSeek", desc: "V4 launch, 10/10" },
    { name: "OpenAI", desc: "GPT-5 debut, 10/10" },
    { name: "Boris Cherny", desc: "Claude Code tips, 10/10" },
    { name: "Anthropic", desc: "Claude 4 Opus, 9/10" },
  ],
};
