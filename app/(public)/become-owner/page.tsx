import ListPgForm from "@/components/pg/ListPgForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List Your PG | PGBook",
  description: "Submit your PG listing to PGBook for admin review. Manage its status and receive inquiries directly.",
};

export default function BecomeOwnerPage() {
  return <ListPgForm />;
}
