import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center p-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Loading...</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Please wait while we fetch your data.
      </p>
    </div>
  );
}
