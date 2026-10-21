import ListPgForm from "@/components/pg/ListPgForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New PG | PGBook Owner",
  description: "Create and submit a new PG listing on PGBook.",
};

export default function OwnerAddPgPage() {
  return <ListPgForm />;
}
