"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Facebook,
  Github,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Palette,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

type Repo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
};

type ServiceImage = Record<string, string>;

const phoneDisplay = "+92 3296104859";
const whatsappHref =
  "https://wa.me/923296104859?text=Hi%20NovaSpark%20Digital%20Agency%2C%20I%20want%20to%20discuss%20a%20project.";
const email = "novasparkahmad@gmail.com";
const githubUsername = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "";
const unsplashKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || "";

const facebookUrl = "https://www.facebook.com/share/1JHhVV6DaT/";
const instagramUrl = "https://www.instagram.com/digitalnovaspark?igsh=MXh4d3N0b2Q0eXhuMg==";

const navItems = [
  ["Hero", "home"],
  ["About", "about"],
  ["Services", "services"],
  ["Portfolio", "portfolio"],
  ["Contact", "contact"]
];

const serviceImageFallbacks: ServiceImage = {
  "Website Development":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
  "AI Automation":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1100&q=80",
  "Content Creation":
    "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1100&q=80"
};

const services = [
  {
    icon: Code2,
    title: "Website Development",
    query: "coding laptop ui development",
    copy: "Fast, conversion-focused websites and web apps built with clean architecture, responsive UI, and deployment-ready performance."
  },
  {
    icon: Bot,
    title: "AI Automation",
    query: "artificial intelligence robotics automation",
    copy: "AI workflows, chatbots, CRM automations, and operational systems that reduce repetitive work and improve response speed."
  },
  {
    icon: Palette,
    title: "Content Creation",
    query: "creative design studio content",
    copy: "Brand visuals, short-form content, landing page copy, and digital campaigns designed to attract and convert better clients."
  }
];

const whyUs = [
  ["AI-first execution", "Modern automation and creative tooling baked into every growth system."],
  ["Conversion focus", "Every section, CTA, and interaction is designed around client inquiries."],
  ["Clean delivery", "Optimized builds, mobile-first layouts, and Vercel-ready deployment practices."],
  ["Business clarity", "Strategy, design, development, and content aligned to one measurable goal."]
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [serviceImages, setServiceImages] = useState<ServiceImage>(serviceImageFallbacks);
  const [formState, setFormState] = useState("Send Message");

  useEffect(() => {
    let active = true;
    const userEndpoint = `https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc&per_page=9`;
    const searchEndpoint =
      "https://api.github.com/search/repositories?q=topic:web-development+topic:ai&sort=updated&order=desc&per_page=9";
    const endpoint = githubUsername ? userEndpoint : searchEndpoint;

    fetch(endpoint, { headers: { Accept: "application/vnd.github+json" } })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub API request failed");
        return response.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items;
        if (active && Array.isArray(items)) setRepos(items.slice(0, 9));
      })
      .catch(() => {
        if (active) setRepos([]);
      })
      .finally(() => {
        if (active) setProjectsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!unsplashKey) return;

    let active = true;
    Promise.all(
      services.map(async (service) => {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            service.query
          )}&per_page=1&orientation=landscape&client_id=${unsplashKey}`
        );
        if (!response.ok) return [service.title, serviceImageFallbacks[service.title]];
        const data = await response.json();
        return [service.title, data.results?.[0]?.urls?.regular || serviceImageFallbacks[service.title]];
      })
    )
      .then((entries) => {
        if (active) setServiceImages(Object.fromEntries(entries));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("Message Ready");
    window.setTimeout(() => setFormState("Send Message"), 2200);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-slate-50">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(0,194,255,0.18),transparent_24rem),radial-gradient(circle_at_84%_20%,rgba(255,122,24,0.18),transparent_25rem),linear-gradient(180deg,#05070d_0%,#080b14_48%,#05070d_100%)]" />
      <div className="grain pointer-events-none fixed inset-0 z-50 opacity-[0.045]" />

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-3" aria-label="NovaSpark Digital home">
            <Image
              src="/nova-spark-logo.jpeg"
              alt="NovaSpark Digital logo"
              width={52}
              height={52}
              priority
              className="h-12 w-12 rounded-lg border border-cyan/40 object-cover shadow-cyan"
            />
            <span>
              <span className="block font-display text-lg font-black leading-none">NovaSpark Digital</span>
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-cyan">AI Growth Agency</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 lg:flex">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition hover:text-cyan">
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <SocialLink href={facebookUrl} label="Facebook">
              <Facebook size={17} />
            </SocialLink>
            <SocialLink href={instagramUrl} label="Instagram">
              <Instagram size={17} />
            </SocialLink>
            <a href="#contact" className="btn-primary">
              Get Started
              <ArrowRight size={17} />
            </a>
          </div>

          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/12 bg-white/6 lg:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-ink/96 px-4 py-4 lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-3">
              {navItems.map(([label, id]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-semibold"
                >
                  {label}
                </a>
              ))}
              <div className="flex gap-3">
                <SocialLink href={facebookUrl} label="Facebook">
                  <Facebook size={17} />
                </SocialLink>
                <SocialLink href={instagramUrl} label="Instagram">
                  <Instagram size={17} />
                </SocialLink>
              </div>
            </div>
          </div>
        )}
      </header>

      <section id="home" className="relative flex min-h-[92vh] items-center px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.7 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-4 py-2 text-sm font-bold text-cyan backdrop-blur">
              <Sparkles size={16} />
              Website Development + AI Automation + Content Creation
            </div>
            <h1 className="max-w-5xl font-display text-4xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Build Your Digital Future with AI-Powered Solutions
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              NovaSpark Digital Agency helps businesses grow with Website Development, AI Automation, and
              Content Creation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#contact" className="btn-primary justify-center px-7 py-4 text-base">
                Get Started
                <Rocket size={19} />
              </a>
              <a href="#contact" className="btn-secondary justify-center px-7 py-4 text-base">
                Contact Us
                <MessageCircle size={19} />
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.12 }}
            className="glass-panel relative overflow-hidden p-5 sm:p-7"
          >
            <div className="absolute right-0 top-0 h-48 w-48 bg-orange/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 bg-cyan/20 blur-3xl" />
            <div className="relative">
              <Image
                src="/nova-spark-logo.jpeg"
                alt="NovaSpark Digital brand mark"
                width={720}
                height={720}
                className="aspect-square w-full rounded-lg object-cover"
                priority
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {["Launch", "Automate", "Scale"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-center">
                    <p className="font-display text-xl font-black text-white">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Section id="about" eyebrow="About" title="A focused digital agency for businesses that need modern systems, not just pretty pages.">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel p-6 sm:p-8">
            <p className="text-lg leading-8 text-slate-300">
              NovaSpark Digital Agency blends premium web design, practical AI automation, and content strategy
              into one client acquisition engine. The goal is simple: make your brand easier to trust, contact,
              and buy from.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["3", "Core services"],
              ["24/7", "Digital presence"],
              ["AI", "Workflow advantage"]
            ].map(([number, label]) => (
              <div key={label} className="glass-panel p-6 text-center">
                <div className="font-display text-4xl font-black text-cyan">{number}</div>
                <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="services" eyebrow="Services" title="Three high-impact services delivered in the order your business needs them.">
        <div className="grid gap-5 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={reveal}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              className="group glass-card overflow-hidden"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={serviceImages[service.title]}
                  alt={`${service.title} visual`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-lg bg-cyan p-3 text-ink shadow-cyan">
                  <service.icon size={25} />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-2xl font-black">{service.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{service.copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      <CtaBand title="Ready to turn attention into qualified leads?" button="Start Your Project" href="#contact" />

      <Section id="why" eyebrow="Why Choose Us" title="Premium execution for brands that want a sharper digital edge.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {whyUs.map(([title, copy], index) => (
            <div key={title} className="glass-panel p-6 transition hover:-translate-y-1 hover:border-cyan/55">
              <span className="mb-5 inline-flex rounded-lg bg-orange/12 p-3 text-orange">
                {[Zap, Star, ShieldCheck, CheckCircle2][index]({ size: 25 })}
              </span>
              <h3 className="font-display text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{copy}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="portfolio" eyebrow="Portfolio" title="Real public repositories loaded dynamically from the GitHub API.">
        {projectsLoading || repos.length === 0 ? (
          <div className="glass-panel p-8 text-center text-lg font-semibold text-slate-300">Projects loading...</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, index) => (
              <motion.article
                key={repo.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={reveal}
                transition={{ duration: 0.5, delay: index * 0.04 }}
                className="glass-card flex min-h-64 flex-col p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-cyan/12 p-3 text-cyan">
                    <Github size={23} />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                    <Star size={14} />
                    {repo.stargazers_count ?? 0}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-black">{repo.name}</h3>
                <p className="mt-3 line-clamp-3 flex-1 leading-7 text-slate-300">
                  {repo.description || "Public GitHub repository with active source code and project history."}
                </p>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold uppercase tracking-[0.16em] text-orange">
                    {repo.language || "Code"}
                  </span>
                  <a href={repo.html_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-cyan">
                    GitHub
                    <ArrowRight size={16} />
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </Section>

      <Section id="contact" eyebrow="Contact" title="Tell NovaSpark Digital what you want to build next.">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-5">
            <ContactCard icon={Phone} label="Phone / WhatsApp" value={phoneDisplay} href={whatsappHref} />
            <ContactCard icon={Mail} label="Email" value={email} href={`mailto:${email}`} />
            <div className="glass-panel p-6">
              <h3 className="font-display text-2xl font-black">Direct response channels</h3>
              <p className="mt-3 leading-7 text-slate-300">
                Use WhatsApp for fast project discussions or email your requirements for website, automation, and
                content work.
              </p>
            </div>
          </div>

          <form onSubmit={submitContact} className="glass-panel p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Name" placeholder="Your name" required />
              <Field name="email" label="Email" placeholder="name@email.com" required type="email" />
            </div>
            <label className="mt-4 block text-sm font-bold text-slate-200">
              Message
              <textarea
                name="message"
                rows={6}
                placeholder="Tell us about your business, goals, timeline, and the service you need."
                required
                className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan"
              />
            </label>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan px-6 py-4 font-black text-ink shadow-cyan transition hover:-translate-y-0.5 hover:bg-white">
              {formState}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </Section>

      <footer className="border-t border-white/10 bg-black/25 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/nova-spark-logo.jpeg"
              alt="NovaSpark Digital logo"
              width={46}
              height={46}
              className="h-11 w-11 rounded-lg border border-cyan/35 object-cover"
            />
            <div>
              <p className="font-display text-lg font-black">NovaSpark Digital Agency</p>
              <p className="text-sm text-slate-400">AI-powered digital growth systems.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SocialLink href={facebookUrl} label="Facebook">
              <Facebook size={17} />
            </SocialLink>
            <SocialLink href={instagramUrl} label="Instagram">
              <Instagram size={17} />
            </SocialLink>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary">
              WhatsApp
              <MessageCircle size={17} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-3xl"
        >
          <div className="mb-4 inline-flex rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-cyan">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-black leading-tight sm:text-5xl">{title}</h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  placeholder,
  required = false,
  type = "text"
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm font-bold text-slate-200">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-lg border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan"
      />
    </label>
  );
}

function CtaBand({ title, button, href }: { title: string; button: string; href: string }) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-lg border border-orange/30 bg-orange/10 p-6 shadow-orange sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange">Client acquisition starts here</p>
          <h2 className="mt-2 font-display text-3xl font-black">{title}</h2>
        </div>
        <a href={href} className="btn-primary shrink-0 justify-center px-6 py-4">
          {button}
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="group glass-panel flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:border-cyan/55"
    >
      <span className="rounded-lg bg-cyan/12 p-4 text-cyan">
        <Icon size={25} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
        <span className="mt-1 block break-words font-display text-xl font-black">{value}</span>
      </span>
      <ArrowRight className="ml-auto hidden shrink-0 text-cyan transition group-hover:translate-x-1 sm:block" size={19} />
    </a>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/6 px-3 text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan/60 hover:text-cyan"
    >
      {children}
    </a>
  );
}
