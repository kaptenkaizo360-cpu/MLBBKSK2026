import { Shield, Cpu } from "lucide-react";

// Logo teknologi (guna ikon SVG inline supaya tiada masalah hak cipta imej)
const TECH = [
  { name: "Apple", svg: "M16.4 12.9c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8zM14 5.6c.6-.8 1.1-1.9 1-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.2z" },
  { name: "Windows", svg: "M3 5.5l7.5-1v7.2H3V5.5zm0 13l7.5 1v-7.1H3v6.1zM11.3 4.3L21 3v8.4h-9.7V4.3zm0 8.3H21V21l-9.7-1.3v-7.1z" },
  { name: "Intel", svg: "M2 8h2.5v8H2V8zm4 0h6c2 0 3 1.2 3 3v5h-2.4v-4.6c0-1-.6-1.4-1.5-1.4H8.4V16H6V8zm11 0h5v2.2h-2.6v1h2.4v2.1h-2.4v.5c0 .3.2.5.5.5H22V16h-3c-1.2 0-2-.8-2-2V8z" },
  { name: "Linux", svg: "M12 2c-1.8 0-3 1.6-3 3.4 0 1 .2 1.6.2 2.4 0 .9-1.2 2.3-1.8 3.6-.7 1.4-1.6 2.9-1.6 4.6 0 .8.3 1.3.7 1.7-.1.4-.2.8-.2 1 0 1 1.4 1.5 3 1.8 1.5.3 2 .6 2.7.6s1.2-.3 2.7-.6c1.6-.3 3-.8 3-1.8 0-.2-.1-.6-.2-1 .4-.4.7-.9.7-1.7 0-1.7-.9-3.2-1.6-4.6-.6-1.3-1.8-2.7-1.8-3.6 0-.8.2-1.4.2-2.4C15 3.6 13.8 2 12 2zm-1.2 4.1c.4 0 .7.4.7.9s-.3.9-.7.9-.7-.4-.7-.9.3-.9.7-.9zm2.4 0c.4 0 .7.4.7.9s-.3.9-.7.9-.7-.4-.7-.9.3-.9.7-.9z" },
  { name: "NVIDIA", svg: "M3 9c2.5-1.5 5.5-2 8-1.5V9c-2-.3-4 0-5.5 1C4 11 3.3 12.8 3.5 14.5 2.5 13 2 11 3 9zm6 0c1.8-.5 3.8-.2 5 1 1 1 1.3 2.5 1 3.8-.3 1.2-1.2 2.2-2.5 2.7v-2c.6-.4 1-1 1-1.7 0-1.2-1-2.2-2.5-2.2-.6 0-1.2.2-1.5.4V9z" },
  { name: "AMD", svg: "M4 6h7l3 3h6v9h-2.5v-6.5h-2.5l-3-3H6.5v9.5L4 18V6zm10.5 9.5L17 18h-2.5v-2.5z" },
  { name: "Anthropic", svg: "M7 17l4-10h2l4 10h-2.3l-.9-2.3h-3.6L9.3 17H7zm3.9-4.2h2.2L12 9.8l-1.1 3z" },
];

export default function Footer() {
  return (
    <footer className="glass !rounded-none border-x-0 border-b-0 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-white/70 mb-5 justify-center">
          <Shield size={16} className="text-gold" />
          <span>Karnival Kokurikulum, Sukan & Kesenian Pendidikan Khas Negeri Johor 2026</span>
        </div>

        <div className="flex items-center gap-2 justify-center mb-4 text-gold/60 text-xs">
          <Cpu size={14} /> Dikuasakan oleh teknologi
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
          {TECH.map((t) => (
            <div key={t.name} className="flex flex-col items-center gap-1 group">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white/55 group-hover:fill-gold transition" aria-label={t.name}>
                <path d={t.svg} />
              </svg>
              <span className="text-[10px] text-white/40 group-hover:text-gold/80 transition">{t.name}</span>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-white/40 mt-6">
          © 2026 Unit Pendidikan Khas · PPKI Daerah Kluang · Negeri Johor
        </div>
      </div>
    </footer>
  );
}
