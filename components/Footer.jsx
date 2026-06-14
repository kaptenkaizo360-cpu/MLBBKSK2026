import { Shield } from "lucide-react";
export default function Footer() {
  return (
    <footer className="glass !rounded-none border-x-0 border-b-0 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-gold" />
          <span>Karnival Kokurikulum, Sukan & Permainan Pendidikan Khas Negeri Johor</span>
        </div>
        <span>© 2026 Unit Pendidikan Khas JPN Johor</span>
      </div>
    </footer>
  );
}
