import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-stone-50">
      <Loader2 className="h-8 w-8 animate-spin text-stone-400 mb-4" />
      <p className="text-sm font-medium text-stone-500 animate-pulse">
        Preparando o cardápio...
      </p>
    </div>
  );
}