"use client";
// StudentForm — reusable form for adding and editing a student
// Supports both profile image URL input and file upload

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gqlFetch } from "@/lib/gqlFetch";

interface StudentFormProps {
  initialValues?: {
    id?: number;
    name: string;
    email: string;
    department: string;
    year: number;
    profileImage: string;
  };
}

const ADD_MUTATION = `
  mutation AddStudent($name: String!, $email: String!, $department: String!, $year: Int!, $profileImage: String) {
    addStudent(name: $name, email: $email, department: $department, year: $year, profileImage: $profileImage) { id }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateStudent($id: Int!, $name: String, $email: String, $department: String, $year: Int, $profileImage: String) {
    updateStudent(id: $id, name: $name, email: $email, department: $department, year: $year, profileImage: $profileImage) { id }
  }
`;

export default function StudentForm({ initialValues }: StudentFormProps) {
  const router = useRouter();
  const isEdit = !!initialValues?.id;

  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    email: initialValues?.email ?? "",
    department: initialValues?.department ?? "",
    year: initialValues?.year ?? 1,
    profileImage: initialValues?.profileImage ?? "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialValues?.profileImage ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "year" ? Number(value) : value }));
  }

  // When a file is chosen, create a local preview URL
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  }

  // Upload file to /api/upload and return the resulting URL
  async function uploadImage(): Promise<string> {
    if (!imageFile) return form.profileImage;
    const token = localStorage.getItem("token") ?? "";
    const fd = new FormData();
    fd.append("file", imageFile);
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Upload failed");
    return json.url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Upload image first if a file was selected
      const profileImage = await uploadImage();
      const payload = { ...form, profileImage };

      if (isEdit) {
        await gqlFetch(UPDATE_MUTATION, { id: initialValues!.id, ...payload });
      } else {
        await gqlFetch(ADD_MUTATION, payload);
      }
      router.push("/students");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-blue-700">{isEdit ? "Edit Student" : "Add Student"}</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {(["name", "email", "department"] as const).map((field) => (
        <input
          key={field}
          name={field}
          type={field === "email" ? "email" : "text"}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ))}

      {/* Year dropdown */}
      <select
        name="year"
        value={form.year}
        onChange={handleChange}
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {[1, 2, 3, 4].map((y) => (
          <option key={y} value={y}>Year {y}</option>
        ))}
      </select>

      {/* Profile image — file upload */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">Profile Image (upload or paste URL)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <input
          name="profileImage"
          type="url"
          placeholder="…or paste image URL"
          value={form.profileImage}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {/* Image preview */}
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="mt-2 w-20 h-20 rounded-full object-cover border" />
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Add Student"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/students")}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
