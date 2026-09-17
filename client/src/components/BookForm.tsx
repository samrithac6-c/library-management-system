import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Book, BookPayload } from "@/lib/booksApi";
import { useEffect, useState } from "react";

const categories = ["Programming", "Design", "Science", "History", "Literature", "Business"];

type FormErrors = Partial<Record<keyof BookPayload, string>>;

type BookFormProps = {
  initialBook?: Book | null;
  isSaving: boolean;
  onSubmit: (payload: BookPayload) => Promise<void>;
  onCancel: () => void;
};

function createInitialState(book?: Book | null): BookPayload {
  return {
    title: book?.title || "",
    author: book?.author || "",
    isbn: book?.isbn || "",
    category: book?.category || "Programming",
    publisher: book?.publisher || "",
    publicationYear: book?.publicationYear || new Date().getFullYear(),
    quantity: book?.quantity || 1,
  };
}

export default function BookForm({ initialBook, isSaving, onSubmit, onCancel }: BookFormProps) {
  const [form, setForm] = useState<BookPayload>(() => createInitialState(initialBook));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(createInitialState(initialBook));
    setErrors({});
  }, [initialBook]);

  const updateField = <K extends keyof BookPayload>(field: K, value: BookPayload[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    const requiredFields: Array<keyof BookPayload> = ["title", "author", "isbn", "category", "publisher"];
    for (const field of requiredFields) {
      if (!String(form[field]).trim()) nextErrors[field] = "This field is required";
    }
    if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be a whole number greater than 0";
    }
    const currentYear = new Date().getFullYear();
    if (!Number.isInteger(Number(form.publicationYear)) || Number(form.publicationYear) < 1000 || Number(form.publicationYear) > currentYear) {
      nextErrors.publicationYear = `Enter a year between 1000 and ${currentYear}`;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    await onSubmit({
      ...form,
      title: form.title.trim(),
      author: form.author.trim(),
      isbn: form.isbn.trim(),
      category: form.category.trim(),
      publisher: form.publisher.trim(),
      publicationYear: Number(form.publicationYear),
      quantity: Number(form.quantity),
    });
  };

  const field = (name: keyof BookPayload, label: string, placeholder: string, type = "text") => (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        value={form[name] as string | number}
        type={type}
        placeholder={placeholder}
        onChange={(event) => updateField(name, type === "number" ? Number(event.target.value) : event.target.value)}
        aria-invalid={Boolean(errors[name])}
        className={errors[name] ? "border-destructive focus-visible:ring-destructive" : ""}
      />
      {errors[name] && <p className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {field("title", "Title", "e.g. Atomic Habits")}
        {field("author", "Author", "e.g. James Clear")}
        {field("isbn", "ISBN", "e.g. 9780132350884")}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>
        {field("publisher", "Publisher", "e.g. Penguin Random House")}
        {field("publicationYear", "Publication year", "2024", "number")}
        {field("quantity", "Quantity", "1", "number")}
      </div>
      <div className="flex justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : initialBook ? "Save changes" : "Add book"}</Button>
      </div>
    </form>
  );
}
