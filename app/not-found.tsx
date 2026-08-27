import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center p-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <MapPinOff className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-4xl font-heading font-black mb-4">404 - Not Found</h2>
      <p className="text-muted-foreground text-lg mb-8 max-w-md text-center">
        Looks like this place doesn't exist. The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button size="lg" className="w-full font-bold">Go Home</Button>
        </Link>
        <Link href="/explore">
          <Button size="lg" variant="outline" className="w-full font-bold">Explore PGs</Button>
        </Link>
      </div>
    </div>
  );
}
