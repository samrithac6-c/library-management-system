import BookForm from "@/components/BookForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { booksApi, type ApiError, type Book, type BookPayload } from "@/lib/booksApi";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  LayoutDashboard,
  Library,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function StatusBadge({ book }: { book: Book }) {
  const isAvailable = book.availableQuantity > 0;
  return (
    <Badge className={isAvailable ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50"} variant="outline">
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isAvailable ? "bg-emerald-500" : "bg-rose-500"}`} />
      {isAvailable ? "Available" : "Out of stock"}
    </Badge>
  );
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingBook, setViewingBook] = useState<Book | null>(null);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      setBooks(await booksApi.list(search, category));
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadBooks(), 220);
    return () => window.clearTimeout(timeout);
  }, [loadBooks]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const categories = useMemo(() => Array.from(new Set(books.map((book) => book.category))).sort(), [books]);
  const stats = useMemo(() => ({
    titles: books.length,
    copies: books.reduce((sum, book) => sum + book.quantity, 0),
    available: books.reduce((sum, book) => sum + book.availableQuantity, 0),
    categories: categories.length,
  }), [books, categories.length]);

  const handleSave = async (payload: BookPayload) => {
    setIsSaving(true);
    try {
      if (editingBook) {
        await booksApi.update(editingBook.id, payload);
        setNotice({ type: "success", message: "Book details updated successfully." });
      } else {
        await booksApi.create(payload);
        setNotice({ type: "success", message: "Book added to the library." });
      }
      setDialogOpen(false);
      setEditingBook(null);
      await loadBooks();
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete “${book.title}” from the library?`)) return;
    try {
      await booksApi.remove(book.id);
      setNotice({ type: "success", message: "Book deleted successfully." });
      await loadBooks();
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    }
  };

  const handleInventoryAction = async (book: Book, action: "issue" | "return") => {
    try {
      const updated = action === "issue" ? await booksApi.issue(book.id) : await booksApi.returnBook(book.id);
      setBooks((current) => current.map((item) => item.id === updated.id ? updated : item));
      setViewingBook(updated);
      setNotice({ type: "success", message: action === "issue" ? "Book issued. Availability updated." : "Book returned. Availability updated." });
    } catch (error) {
      setNotice({ type: "error", message: getErrorMessage(error) });
    }
  };

  const openCreate = () => {
    setEditingBook(null);
    setDialogOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><Library className="h-5 w-5" /></div>
            <div><p className="font-semibold leading-tight">Libra</p><p className="text-xs text-slate-400">Library workspace</p></div>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
            <button className="flex w-full items-center gap-3 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-700"><LayoutDashboard className="h-4 w-4" /> Overview</button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50"><BookOpen className="h-4 w-4" /> Books</button>
          </nav>
          <div className="m-4 rounded-xl bg-slate-50 p-4"><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600"><Sparkles className="h-3.5 w-3.5 text-blue-600" /> SOP ready</div><p className="text-xs leading-5 text-slate-500">Connected to the Spring Boot REST API and MySQL persistence.</p></div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
            <div><p className="text-xs font-medium text-slate-400">Library Management System</p><h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Overview</h1></div>
            <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-medium">Librarian</p><p className="text-xs text-slate-400">Administrator</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">LM</div></div>
          </header>

          <div className="mx-auto max-w-7xl space-y-7 p-5 sm:p-8">
            {notice && <div className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`} role="status"><div className="flex items-center gap-2">{notice.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}{notice.message}</div><button onClick={() => setNotice(null)} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total titles" value={stats.titles} detail="From database" icon={<BookOpen className="h-4 w-4" />} />
              <StatCard label="Total copies" value={stats.copies} detail="Across all titles" icon={<Library className="h-4 w-4" />} />
              <StatCard label="Available now" value={stats.available} detail="Ready to issue" icon={<CheckCircle2 className="h-4 w-4" />} accent="green" />
              <StatCard label="Categories" value={stats.categories} detail="Unique subjects" icon={<Sparkles className="h-4 w-4" />} accent="purple" />
            </section>

            <Card className="border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
              <CardHeader className="gap-5 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div><CardTitle className="text-lg">Book collection</CardTitle><p className="mt-1 text-sm text-slate-500">Manage the catalog, inventory, and availability.</p></div>
                <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingBook(null); }}>
                  <DialogTrigger asChild><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> Add book</Button></DialogTrigger>
                  <DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{editingBook ? "Edit book" : "Add a new book"}</DialogTitle><DialogDescription>{editingBook ? "Update the catalog record. Issued copies remain accounted for." : "Create a persistent book record in MySQL."}</DialogDescription></DialogHeader><BookForm initialBook={editingBook} isSaving={isSaving} onSubmit={handleSave} onCancel={() => setDialogOpen(false)} /></DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 md:flex-row">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title, author, or ISBN" className="border-slate-200 pl-9" /></div>
                  <div className="relative md:w-48"><select value={category} onChange={(event) => setCategory(event.target.value)} className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-600 outline-none focus:ring-1 focus:ring-blue-500"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3 font-medium">Book</th><th className="px-4 py-3 font-medium">ISBN</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Year</th><th className="px-4 py-3 font-medium">Inventory</th><th className="px-4 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">{isLoading ? <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-slate-500">Loading books from MySQL...</td></tr> : books.length === 0 ? <tr><td colSpan={7} className="px-5 py-14 text-center"><div className="mx-auto max-w-sm"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-medium text-slate-700">No books found</p><p className="mt-1 text-sm text-slate-500">Try another search or add a new catalog record.</p></div></td></tr> : books.map((book) => <tr key={book.id} className="transition-colors hover:bg-slate-50/70"><td className="px-5 py-4"><div className="font-medium text-slate-800">{book.title}</div><div className="mt-1 text-xs text-slate-400">{book.author} · {book.publisher}</div></td><td className="px-4 py-4 font-mono text-xs text-slate-500">{book.isbn}</td><td className="px-4 py-4"><Badge variant="outline" className="border-slate-200 font-normal text-slate-500">{book.category}</Badge></td><td className="px-4 py-4 text-slate-500">{book.publicationYear}</td><td className="px-4 py-4"><span className="font-medium text-slate-700">{book.availableQuantity}</span><span className="text-slate-400"> / {book.quantity}</span></td><td className="px-4 py-4"><StatusBadge book={book} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title="View book" onClick={() => setViewingBook(book)}><Search className="h-4 w-4 text-slate-500" /></Button><Button variant="ghost" size="icon" title="Edit book" onClick={() => openEdit(book)}><Pencil className="h-4 w-4 text-slate-500" /></Button><Button variant="ghost" size="icon" title="Delete book" onClick={() => void handleDelete(book)}><Trash2 className="h-4 w-4 text-rose-500" /></Button></div></td></tr>)}</tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-400"><span>Showing {books.length} record{books.length === 1 ? "" : "s"}</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live database data</span></div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={Boolean(viewingBook)} onOpenChange={(open) => !open && setViewingBook(null)}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{viewingBook?.title}</DialogTitle><DialogDescription>{viewingBook?.author} · {viewingBook?.publisher}</DialogDescription></DialogHeader>{viewingBook && <div className="space-y-5"><div className="grid grid-cols-2 gap-3 text-sm">{[["ISBN", viewingBook.isbn], ["Category", viewingBook.category], ["Publication year", viewingBook.publicationYear], ["Total quantity", viewingBook.quantity]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-medium text-slate-700">{value}</p></div>)}<div className="col-span-2 rounded-lg border border-blue-100 bg-blue-50 p-4"><div className="flex items-center justify-between"><div><p className="text-xs text-blue-600">Availability</p><p className="mt-1 text-2xl font-semibold text-blue-900">{viewingBook.availableQuantity} <span className="text-sm font-normal text-blue-700">of {viewingBook.quantity} copies</span></p></div><StatusBadge book={viewingBook} /></div></div></div><div className="flex flex-wrap justify-end gap-2 border-t pt-4"><Button variant="outline" onClick={() => void handleInventoryAction(viewingBook, "return")} disabled={viewingBook.availableQuantity >= viewingBook.quantity} className="gap-2"><ArrowDownToLine className="h-4 w-4" /> Return</Button><Button onClick={() => void handleInventoryAction(viewingBook, "issue")} disabled={viewingBook.availableQuantity <= 0} className="gap-2"><ArrowUpFromLine className="h-4 w-4" /> Issue</Button></div></div>}</DialogContent></Dialog>
    </div>
  );
}

function StatCard({ label, value, detail, icon, accent = "blue" }: { label: string; value: number; detail: string; icon: React.ReactNode; accent?: "blue" | "green" | "purple" }) {
  const colors = { blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600", purple: "bg-violet-50 text-violet-600" };
  return <Card className="border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p></div><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[accent]}`}>{icon}</div></div><p className="mt-4 text-xs text-slate-400">{detail}</p></CardContent></Card>;
}

function getErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String((error as ApiError).message);
  return "The request could not be completed. Please try again.";
}
