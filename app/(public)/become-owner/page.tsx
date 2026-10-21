import ListPgForm from "@/components/pg/ListPgForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your PG | PGBook",
  description: "List your PG accommodation on PGBook. Reach thousands of verified students and working professionals looking for accommodation.",
};

export default function BecomeOwnerPage() {
  return <ListPgForm />;
}
