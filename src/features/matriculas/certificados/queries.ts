import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CertificateOption = {
  id: string;
  label: string;
};

export type CertificateData = {
  courseName: string;
  date: string;
  schoolName: string;
  studentName: string;
  workloadHours: number;
};

export async function getCertificateData({
  certificateDate,
  enrollmentId,
}: {
  certificateDate: string;
  enrollmentId?: string;
}) {
  const identity = await getWorkspaceIdentity();

  if (!identity?.organizationId) {
    return {
      certificate: null,
      options: [] as CertificateOption[],
    };
  }

  const supabase = await createClient();
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id, course_class_id, status")
    .eq("organization_id", identity.organizationId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(100);

  if (enrollmentsError) {
    throw new Error("Nao foi possivel carregar as matriculas para certificado.");
  }

  const enrollmentRows = enrollments ?? [];

  if (!enrollmentRows.length) {
    return {
      certificate: null,
      options: [] as CertificateOption[],
    };
  }

  const studentIds = [
    ...new Set(enrollmentRows.map((enrollment) => enrollment.student_id)),
  ];
  const classIds = [
    ...new Set(enrollmentRows.map((enrollment) => enrollment.course_class_id)),
  ];

  const [studentsResult, classesResult] = await Promise.all([
    supabase
      .from("students")
      .select("id, name")
      .eq("organization_id", identity.organizationId)
      .in("id", studentIds),
    supabase
      .from("course_classes")
      .select("id, course_id")
      .eq("organization_id", identity.organizationId)
      .in("id", classIds),
  ]);

  if (studentsResult.error) {
    throw new Error("Nao foi possivel carregar os alunos para certificado.");
  }

  if (classesResult.error) {
    throw new Error("Nao foi possivel carregar as turmas para certificado.");
  }

  const classRows = classesResult.data ?? [];
  const courseIds = [...new Set(classRows.map((courseClass) => courseClass.course_id))];
  const coursesResult = courseIds.length
    ? await supabase
        .from("courses")
        .select("id, name, workload_hours")
        .eq("organization_id", identity.organizationId)
        .in("id", courseIds)
    : { data: [], error: null };

  if (coursesResult.error) {
    throw new Error("Nao foi possivel carregar os cursos para certificado.");
  }

  const studentNames = new Map(
    (studentsResult.data ?? []).map((student) => [student.id, student.name]),
  );
  const classCourses = new Map(
    classRows.map((courseClass) => [courseClass.id, courseClass.course_id]),
  );
  const courses = new Map(
    (coursesResult.data ?? []).map((course) => [course.id, course]),
  );
  const options = enrollmentRows.map((enrollment) => {
    const studentName = studentNames.get(enrollment.student_id) ?? "Aluno";
    const courseId = classCourses.get(enrollment.course_class_id);
    const courseName = courseId
      ? (courses.get(courseId)?.name ?? "Curso")
      : "Curso";

    return {
      id: enrollment.id,
      label: `${studentName} - ${courseName}`,
    };
  });
  const selectedEnrollment =
    enrollmentRows.find((enrollment) => enrollment.id === enrollmentId) ?? null;

  if (!selectedEnrollment) {
    return {
      certificate: null,
      options,
    };
  }

  const courseId = classCourses.get(selectedEnrollment.course_class_id);
  const course = courseId ? courses.get(courseId) : null;

  return {
    certificate: {
      courseName: course?.name ?? "Curso",
      date: certificateDate,
      schoolName: identity.organizationName,
      studentName: studentNames.get(selectedEnrollment.student_id) ?? "Aluno",
      workloadHours: course?.workload_hours ?? 0,
    } satisfies CertificateData,
    options,
  };
}
