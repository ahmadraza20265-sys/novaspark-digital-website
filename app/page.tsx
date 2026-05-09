"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Mail,
  MessageCircle,
  Play,
  Send,
  Sparkles,
  Star,
  WandSparkles,
  Zap
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const whatsappNumber = "923296104859";
const email = "novasparkahmad@gmail.com";

const services = [
  {
    icon: BrainCircuit,
    title: "AI Automation",
    copy: "Custom AI workflows, chatbots, lead routing, CRM automations, and business systems that run without manual follow-up.",
    accent: "from-electric to-cyan-200"
  },
  {
    icon: Code2,
    title: "Website Development",
    copy: "High-converting websites, landing pages, funnels, and dashboards built with fast, premium, responsive engineering.",
    accent: "from-white to-electric"
  },
  {
    icon: WandSparkles,
    title: "Content Creation",
    copy: "Cinematic visuals, social content systems, brand storytelling, short-form assets, and creative campaigns.",
    accent: "from-flare to-ember"
  }
];

const projects = [
  ["AI Sales Console", "Automated lead capture, qualification, and WhatsApp booking flow."],
  ["Luxury SaaS Launch", "Premium responsive website with conversion-focused motion design."],
  ["Creator Growth Engine", "Content calendar, video hooks, captions, and performance dashboard."]
];

const testimonials = [
  {
    quote:
      "NovaSpark gave our brand a premium digital presence and automated the follow-up we were losing every week.",
    name: "Ayaan R.",
    role: "Founder, ScaleGrid"
  },
  {
    quote:
      "The site looks elite, loads fast, and the automation flow helped us respond to leads instantly.",
    name: "Maham K.",
    role: "Marketing Director"
  },
  {
    quote:
      "They turned our content process into a system. Strategy, visuals, publishing, and reporting all became cleaner.",
    name: "Daniyal S.",
    role: "Agency Partner"
  }
];

const pricing = [
  ["Launch", "Website landing page", "WhatsApp lead funnel", "Basic content kit"],
  ["Growth", "Multi-page website", "AI chatbot automation", "Monthly content system"],
  ["Scale", "Full AI operations suite", "Custom dashboard", "Creative growth campaigns"]
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(mouseX, { stiffness: 80, damping: 24 });
  const glowY = useSpring(mouseY, { stiffness: 80, damping: 24 });
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        left: `${(index * 29) % 100}%`,
        top: `${(index * 47) % 100}%`,
        delay: `${(index % 9) * 0.38}s`,
        size: 2 + (index % 4)
      })),
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 1200);
    const move = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", move);
    };
  }, [mouseX, mouseY]);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const message = String(data.get("message") || "");
    const subject = encodeURIComponent(`NovaSpark inquiry from ${name || "website visitor"}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-midnight text-white">
      {loading && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#02030a]"
          exit={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex w-72 flex-col items-center gap-6">
            <Image
              src="/nova-spark-logo.jpeg"
              alt="NovaSpark Digital logo"
              width={112}
              height={112}
              className="rounded-full object-cover shadow-blue-glow"
              priority
            />
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className="loading-bar h-full origin-left rounded-full bg-gradient-to-r from-electric via-white to-ember" />
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className="pointer-events-none fixed z-50 hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-electric/20 blur-3xl md:block"
        style={{ left: glowX, top: glowY }}
      />
      <div className="noise pointer-events-none fixed inset-0 z-10" />

      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#03050d]/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#hero" className="flex items-center gap-3">
            <Image
              src="/nova-spark-logo.jpeg"
              alt="NovaSpark Digital"
              width={44}
              height={44}
              className="rounded-xl object-cover shadow-blue-glow"
            />
            <span className="font-display text-lg font-bold">NovaSpark Digital</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            {["Services", "Work", "Pricing", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-electric">
                {item}
              </a>
            ))}
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            className="group inline-flex items-center gap-2 rounded-full border border-ember/40 bg-ember/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-ember hover:bg-ember/20 hover:shadow-orange-glow"
          >
            WhatsApp <MessageCircle size={16} className="transition group-hover:scale-110" />
          </a>
        </div>
      </nav>

      <section id="hero" className="relative flex min-h-screen items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="grid-mask absolute inset-0 opacity-70" />
        <motion.div
          className="aurora absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        {particles.map((particle) => (
          <span
            key={`${particle.left}-${particle.top}`}
            className="particle absolute z-0 rounded-full bg-white"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              boxShadow: "0 0 16px rgba(18, 200, 255, 0.85)"
            }}
          />
        ))}

        <div className="relative z-20 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div initial="hidden" animate="visible" variants={reveal} transition={{ duration: 0.75 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-200 backdrop-blur-xl">
              <Sparkles size={16} className="text-flare" />
              Premium AI systems, websites, and content engines
            </div>
            <h1 className="font-display text-5xl font-black leading-[1.02] sm:text-6xl lg:text-7xl">
              Build a brand that feels <span className="neon-text">impossible to ignore.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              NovaSpark Digital creates futuristic AI automation, high-performance websites, and
              cinematic content systems for businesses ready to look sharper, move faster, and close more.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric via-white to-ember px-6 py-4 font-bold text-black shadow-blue-glow transition hover:scale-[1.02]"
              >
                Start a project <ArrowRight size={19} className="transition group-hover:translate-x-1" />
              </a>
              <a
                href="#work"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-4 font-semibold text-white backdrop-blur-xl transition hover:border-electric/60 hover:text-electric"
              >
                <Play size={18} /> View work
              </a>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
              {["AI-first", "Premium UI", "Fast launch"].map((item) => (
                <div key={item} className="glass rounded-2xl px-4 py-4 text-center text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.88, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative mx-auto aspect-square w-full max-w-[31rem]"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-electric/40 to-ember/40 blur-3xl" />
            <div className="glass relative flex h-full items-center justify-center rounded-[2rem] p-8">
              <Image
                src="/nova-spark-logo.jpeg"
                alt="NovaSpark Digital glowing star logo"
                width={620}
                height={620}
                className="rounded-3xl object-cover shadow-panel"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      <Section id="services" eyebrow="Services" title="Systems that make the brand feel expensive and the business feel effortless.">
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={reveal}
              transition={{ duration: 0.55, delay: index * 0.08 }}
              whileHover={{ y: -8, scale: 1.01 }}
              className="glass group rounded-3xl p-6 transition hover:border-electric/50"
            >
              <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${service.accent} p-3 text-black shadow-blue-glow`}>
                <service.icon size={26} />
              </div>
              <h3 className="font-display text-2xl font-bold">{service.title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{service.copy}</p>
              <div className="mt-8 flex items-center text-sm font-bold text-electric">
                Explore service <ChevronRight size={17} className="transition group-hover:translate-x-1" />
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section id="about" eyebrow="About" title="A futuristic agency built for execution, not noise.">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass rounded-3xl p-7">
            <p className="text-lg leading-8 text-slate-200">
              NovaSpark Digital blends AI strategy, design taste, web engineering, and content production
              into one focused growth engine. Every project is built to feel premium on the surface and
              practical underneath.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["24/7", "automation-ready lead systems"],
              ["3x", "faster launch workflows"],
              ["100%", "responsive premium interfaces"]
            ].map(([stat, label]) => (
              <div key={stat} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <div className="neon-text font-display text-4xl font-black">{stat}</div>
                <p className="mt-3 text-sm leading-6 text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="work" eyebrow="Portfolio" title="Showcase concepts designed for high-trust digital brands.">
        <div className="grid gap-5 lg:grid-cols-3">
          {projects.map(([title, copy], index) => (
            <motion.article
              key={title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={reveal}
              transition={{ duration: 0.55, delay: index * 0.1 }}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
            >
              <div className="relative h-52 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-electric/45 via-white/10 to-ember/45 transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-6 rounded-3xl border border-white/20 bg-black/25 backdrop-blur-md" />
                <Zap className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.7)]" size={54} />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{copy}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section id="testimonials" eyebrow="Testimonials" title="Premium execution clients can feel.">
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="glass rounded-3xl p-6">
              <div className="mb-5 flex gap-1 text-flare">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={17} fill="currentColor" />
                ))}
              </div>
              <p className="leading-7 text-slate-200">"{testimonial.quote}"</p>
              <div className="mt-6">
                <div className="font-bold">{testimonial.name}</div>
                <div className="text-sm text-slate-400">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="pricing" eyebrow="Pricing Preview" title="Flexible packages for launches, growth, and full-scale automation.">
        <div className="grid gap-5 lg:grid-cols-3">
          {pricing.map((plan, index) => (
            <div
              key={plan[0]}
              className={`rounded-3xl border p-6 ${
                index === 1
                  ? "border-electric/60 bg-electric/10 shadow-blue-glow"
                  : "border-white/10 bg-white/[0.045]"
              }`}
            >
              <h3 className="font-display text-2xl font-bold">{plan[0]}</h3>
              <p className="mt-3 text-slate-400">Custom quote based on scope.</p>
              <div className="mt-6 space-y-4">
                {plan.slice(1).map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-slate-200">
                    <Check size={18} className="text-electric" />
                    {feature}
                  </div>
                ))}
              </div>
              <a href="#contact" className="mt-8 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-5 py-3 font-bold transition hover:border-ember hover:text-ember">
                Request quote
              </a>
            </div>
          ))}
        </div>
      </Section>

      <Section id="contact" eyebrow="Contact" title="Tell NovaSpark what you want to build next.">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <form onSubmit={submitContact} className="glass rounded-3xl p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Name" placeholder="Your name" />
              <Field name="company" label="Company" placeholder="Brand or company" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field name="phone" label="Phone" placeholder="+92..." />
              <Field name="service" label="Service" placeholder="AI, website, content" />
            </div>
            <label className="mt-4 block text-sm font-semibold text-slate-200">
              Message
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Share your project goals..."
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-electric"
              />
            </label>
            <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric via-white to-ember px-6 py-4 font-black text-black shadow-blue-glow transition hover:scale-[1.01]">
              Send inquiry <Send size={18} />
            </button>
          </form>

          <div className="space-y-5">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="glass group flex items-center gap-4 rounded-3xl p-6 transition hover:border-ember/70"
            >
              <span className="rounded-2xl bg-ember/20 p-4 text-ember">
                <MessageCircle size={28} />
              </span>
              <span>
                <span className="block text-sm text-slate-400">WhatsApp</span>
                <span className="font-display text-xl font-bold">+923296104859</span>
              </span>
              <ArrowRight className="ml-auto transition group-hover:translate-x-1" />
            </a>
            <a
              href={`mailto:${email}`}
              className="glass group flex items-center gap-4 rounded-3xl p-6 transition hover:border-electric/70"
            >
              <span className="rounded-2xl bg-electric/20 p-4 text-electric">
                <Mail size={28} />
              </span>
              <span>
                <span className="block text-sm text-slate-400">Email</span>
                <span className="break-all font-display text-xl font-bold">{email}</span>
              </span>
            </a>
          </div>
        </div>
      </Section>

      <footer className="relative z-20 border-t border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/nova-spark-logo.jpeg" alt="NovaSpark Digital" width={42} height={42} className="rounded-xl" />
            <span>NovaSpark Digital © 2026</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="https://instagram.com" className="hover:text-electric">Instagram</a>
            <a href="https://linkedin.com" className="hover:text-electric">LinkedIn</a>
            <a href={`mailto:${email}`} className="hover:text-electric">{email}</a>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-50">
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mb-4 w-[calc(100vw-2.5rem)] max-w-sm rounded-3xl border border-white/15 bg-[#050813]/92 p-5 shadow-panel backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-electric/15 p-3 text-electric">
                <Bot size={24} />
              </div>
              <div>
                <div className="font-display font-bold">Nova AI Assistant</div>
                <div className="text-xs text-slate-400">Online for project questions</div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-white/8 p-4 text-sm leading-6 text-slate-200">
              Hi, I can help you choose between AI Automation, Website Development, and Content Creation.
              Share your goal and NovaSpark will respond on WhatsApp or email.
            </div>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi NovaSpark Digital, I want to discuss a project.")}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black"
            >
              Continue on WhatsApp <MessageCircle size={17} />
            </a>
          </motion.div>
        )}
        <button
          onClick={() => setChatOpen((open) => !open)}
          aria-label="Open AI assistant"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-electric to-ember text-black shadow-blue-glow transition hover:scale-105"
        >
          <Bot size={28} />
        </button>
      </div>
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
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative z-20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          transition={{ duration: 0.6 }}
          className="mb-10 max-w-3xl"
        >
          <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-electric">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-black leading-tight sm:text-5xl">{title}</h2>
        </motion.div>
        {children}
      </div>
    </section>
  );
}

function Field({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <label className="block text-sm font-semibold text-slate-200">
      {label}
      <input
        name={name}
        placeholder={placeholder}
        required={name === "name"}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-electric"
      />
    </label>
  );
}
