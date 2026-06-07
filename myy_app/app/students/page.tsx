"use client";
// Students dashboard — lists all students, supports search and logout

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentCard from "@/components/StudentCard";
import { gqlFetch } from "@/lib/gqlFetch";

interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  year: number;
  profileImage?: string;
}

const GET_STUDENTS = `
  query {
    students {
      id name email department year profileImage
    }
  }
`;

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStudents() {
    setLoading(true);
    try {
      const data = await gqlFetch<{ students: Student[] }>(GET_STUDENTS);
      setStudents(data.students);
    } catch (err: unknown) {
      // If not authenticated, redirect to login
      const msg = err instanceof Error ? err.message : "Error";
      if (msg.toLowerCase().includes("authenticated")) {
        router.push("/login");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchStudents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  // Filter by name, email, or department
  const filtered = students.filter((s) =>
    [s.name, s.email, s.department].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Students</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/students/add")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
          >
            + Add Student
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name, email or department..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {/* States */}
      {loading && <p className="text-center text-gray-400">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-center text-gray-400">No students found.</p>
      )}

      {/* Student list */}
      <div className="space-y-4">
        {filtered.map((s) => (
          <StudentCard key={s.id} student={s} onDeleted={fetchStudents} />
        ))}
      </div>
    </div>
  );
}
