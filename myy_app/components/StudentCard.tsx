"use client";
// StudentCard — displays one student's info with Edit and Delete buttons

import { useRouter } from "next/navigation";
import Image from "next/image";
import { gqlFetch } from "@/lib/gqlFetch";

interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  year: number;
  profileImage?: string;
}

const DELETE_MUTATION = `
  mutation DeleteStudent($id: Int!) {
    deleteStudent(id: $id)
  }
`;

export default function StudentCard({ student, onDeleted }: { student: Student; onDeleted: () => void }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete ${student.name}?`)) return;
    await gqlFetch(DELETE_MUTATION, { id: student.id });
    onDeleted(); // refresh parent list
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
      {/* Profile image or placeholder */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {student.profileImage ? (
          <Image src={student.profileImage} alt={student.name} width={64} height={64} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">👤</div>
        )}
      </div>

      {/* Student details */}
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{student.name}</p>
        <p className="text-sm text-gray-500">{student.email}</p>
        <p className="text-sm text-gray-500">{student.department} — Year {student.year}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => router.push(`/students/edit/${student.id}`)}
          className="text-sm bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-lg transition"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
