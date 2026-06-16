"use client";
import { Save, RotateCcw, Pencil } from "lucide-react";

// Bar tindakan kecil untuk diletak pada setiap bahagian/kolum.
// Tunjuk Save (wajib bila ada perubahan), dan pilihan Reset & Edit.
export default function SectionActions({
  onSave, onReset, onEdit,
  dirty = false,
  saveLabel = "Simpan",
  className = "",
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {onEdit && (
        <button onClick={onEdit} className="btn btn-emerald text-xs !py-1.5 !px-3">
          <Pencil size={14} /> Edit
        </button>
      )}
      {onSave && (
        <button onClick={onSave}
          className={`btn text-xs !py-1.5 !px-3 ${dirty ? "btn-gold animate-pulse" : "btn-gold"}`}>
          <Save size={14} /> {dirty ? `${saveLabel} *` : saveLabel}
        </button>
      )}
      {onReset && (
        <button onClick={onReset} className="btn btn-danger text-xs !py-1.5 !px-3">
          <RotateCcw size={14} /> Reset
        </button>
      )}
    </div>
  );
}
