import { getContacts } from "./actions";
import ContactsList from "./contacts-list";

export default async function ContactsPage() {
  const contacts = await getContacts();

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div>
        <h1 className="text-xl font-semibold">Хэрэглэгчид</h1>
        <p className="text-muted-foreground text-sm">
          Тасалбар авсан хэрэглэгчдийн жагсаалт — оператор, нийт тасалбар, зарцуулсан дүн
        </p>
      </div>
      <ContactsList contacts={contacts} />
    </div>
  );
}
