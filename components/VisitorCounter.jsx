"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

// Namespace unik untuk app ni supaya tak bercampur dengan pengguna lain
// servis yang sama. Servis ini PERCUMA & tiada pendaftaran, tapi ia
// mengira jumlah lawatan (hits) — bukan kiraan IP unik yang 100% tepat.
const NAMESPACE = "mlbb-pk-johor-2026";
const KEY = "pelawat";
const SESSION_FLAG = "mlbb_visit_counted_v1";

// Mula paparan dari 616 — lawatan PERTAMA selepas deploy akan terus tunjuk 616,
// dan naik dari situ. Tak bergantung pada nilai sebenar servis luar.
const BASE_OFFSET = 615;

export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // Kira sekali setiap sesi pelayar (elak satu orang dikira berulang
        // setiap kali tukar halaman dalam lawatan yang sama).
        const alreadyCounted = sessionStorage.getItem(SESSION_FLAG);
        const url = alreadyCounted
          ? `https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`
          : `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("bad response");
        const data = await res.json();
        if (!alive) return;

        if (typeof data?.value === "number") {
          setCount(data.value + BASE_OFFSET);
          sessionStorage.setItem(SESSION_FLAG, "1");
        }
      } catch {
        // Servis luar gagal/tiada — sorok terus, jangan ganggu paparan footer.
        if (alive) setCount(null);
      }
    }

    run();
    return () => { alive = false; };
  }, []);

  // Tiada apa dipaparkan kalau gagal — footer tetap kemas
  if (count === null) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/40 mt-3">
      <Users size={12} className="text-gold/60" />
      <span>{count.toLocaleString("ms-MY")} lawatan</span>
    </div>
  );
}
