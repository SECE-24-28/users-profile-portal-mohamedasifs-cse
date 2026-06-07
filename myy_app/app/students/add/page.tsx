// Add Student page — renders the StudentForm with no initial values

import StudentForm from "@/components/StudentForm";

export default function AddStudentPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <StudentForm />
    </div>
  );
}
