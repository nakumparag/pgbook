export default function AddPgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <div className="container-custom py-8 md:py-12 max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  );
}
