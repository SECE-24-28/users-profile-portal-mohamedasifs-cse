"use client";
// Edit Student page — fetches existing student data and passes it to StudentForm

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentForm from "@/components/StudentForm";
import { gqlFetch } from "@/lib/gqlFetch";

interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  year: number;
  profileImage: string;
}

const GET_STUDENT = `
  query GetStudent($id: Int!) {
    student(id: $id) {
      id name email department year profileImage
    }
  }
`;

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    gqlFetch<{ student: Student }>(GET_STUDENT, { id: Number(id) })
      .then((data) => setStudent(data.student))
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error";
        if (msg.toLowerCase().includes("authenticated")) router.push("/login");
        else setError(msg);
      });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
  if (!student) return <p className="text-center text-gray-400 mt-8">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <StudentForm initialValues={student} />
    </div>
  );
}
