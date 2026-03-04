import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllContacts } from "@/lib/admin-queries";
import { ContactsManager } from "./ContactsManager";

export const metadata = { title: "Contact Submissions" };

export default async function AdminContactsPage() {
  const data = await getAllContacts();

  return (
    <>
      <AdminHeader title="Contact Submissions" />
      <div className="p-8">
        <ContactsManager initialData={data} />
      </div>
    </>
  );
}
