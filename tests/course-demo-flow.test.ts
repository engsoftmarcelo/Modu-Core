import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCourseAction } from "@/features/matriculas/cursos/actions";
import { initialCourseFormState } from "@/features/matriculas/cursos/types";
import { getCertificateData } from "@/features/matriculas/certificados/queries";
import {
  courseDemoDefaults,
  getCourseClassDemoDefaults,
} from "@/features/matriculas/demo/defaults";
import { saveAttendanceAction } from "@/features/matriculas/frequencia/actions";
import { initialAttendanceFormState } from "@/features/matriculas/frequencia/types";
import { createEnrollmentAction } from "@/features/matriculas/inscricoes/actions";
import { initialEnrollmentFormState } from "@/features/matriculas/inscricoes/types";
import { createCourseClassAction } from "@/features/matriculas/turmas/actions";
import { initialCourseClassFormState } from "@/features/matriculas/turmas/types";
import { getWorkspaceIdentity } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getWorkspaceIdentity: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const organizationId = "00000000-0000-4000-8000-000000000001";
const studentId = "00000000-0000-4000-8000-000000000011";
const courseId = "00000000-0000-4000-8000-000000000012";
const classId = "00000000-0000-4000-8000-000000000013";
const enrollmentId = "00000000-0000-4000-8000-000000000014";

const identity = {
  email: "dono@escola.com.br",
  fullName: "Dono da Escola",
  organizationId,
  organizationName: "Escola Horizonte",
  userId: "00000000-0000-4000-8000-000000000002",
};

const createClientMock = vi.mocked(createClient);
const getWorkspaceIdentityMock = vi.mocked(getWorkspaceIdentity);
const redirectMock = vi.mocked(redirect);
const revalidatePathMock = vi.mocked(revalidatePath);

function formData(entries: Array<[string, string]>) {
  const data = new FormData();

  entries.forEach(([key, value]) => data.append(key, value));

  return data;
}

function queueClient(client: unknown) {
  createClientMock.mockResolvedValueOnce(
    client as Awaited<ReturnType<typeof createClient>>,
  );
}

function createInsertClient(id: string) {
  const single = vi.fn().mockResolvedValue({ data: { id }, error: null });
  const select = vi.fn().mockReturnValue({ single });
  const insert = vi.fn().mockReturnValue({ select });
  const from = vi.fn().mockReturnValue({ insert });

  return { client: { from }, from, insert };
}

function createLookupClient(id: string) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: { id }, error: null });
  const organizationEq = vi.fn().mockReturnValue({ maybeSingle });
  const idEq = vi.fn().mockReturnValue({ eq: organizationEq });
  const select = vi.fn().mockReturnValue({ eq: idEq });
  const from = vi.fn().mockReturnValue({ select });

  return { client: { from }, from };
}

function createEnrollmentLookupClient() {
  const inMock = vi.fn().mockResolvedValue({
    data: [{ student_id: studentId }],
    error: null,
  });
  const classEq = vi.fn().mockReturnValue({ in: inMock });
  const organizationEq = vi.fn().mockReturnValue({ eq: classEq });
  const select = vi.fn().mockReturnValue({ eq: organizationEq });
  const from = vi.fn().mockReturnValue({ select });

  return { client: { from }, from };
}

function createAttendanceUpsertClient() {
  const upsert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockReturnValue({ upsert });

  return { client: { from }, from, upsert };
}

function createCertificateClient() {
  const from = vi.fn((table: string) => {
    if (table === "enrollments") {
      const limit = vi.fn().mockResolvedValue({
        data: [
          {
            course_class_id: classId,
            id: enrollmentId,
            status: "enrolled",
            student_id: studentId,
          },
        ],
        error: null,
      });
      const order = vi.fn().mockReturnValue({ limit });
      const neq = vi.fn().mockReturnValue({ order });
      const eq = vi.fn().mockReturnValue({ neq });

      return { select: vi.fn().mockReturnValue({ eq }) };
    }

    const rows =
      table === "students"
        ? [{ id: studentId, name: "Ana Souza" }]
        : table === "course_classes"
          ? [{ course_id: courseId, id: classId }]
          : [
              {
                id: courseId,
                name: courseDemoDefaults.name,
                workload_hours: courseDemoDefaults.workloadHours,
              },
            ];
    const inMock = vi.fn().mockResolvedValue({ data: rows, error: null });
    const eq = vi.fn().mockReturnValue({ in: inMock });

    return { select: vi.fn().mockReturnValue({ eq }) };
  });

  return { from };
}

beforeEach(() => {
  createClientMock.mockReset();
  getWorkspaceIdentityMock.mockReset();
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  getWorkspaceIdentityMock.mockResolvedValue(identity);
});

describe("demo guiada de cursos", () => {
  it("encadeia curso, turma, matricula, frequencia e certificado", async () => {
    const courseDatabase = createInsertClient(courseId);
    queueClient(courseDatabase.client);

    await createCourseAction(
      initialCourseFormState,
      formData([
        ["name", courseDemoDefaults.name],
        ["description", courseDemoDefaults.description],
        ["workloadHours", String(courseDemoDefaults.workloadHours)],
        ["price", String(courseDemoDefaults.price)],
        ["modality", courseDemoDefaults.modality],
        ["active", "active"],
        ["demo", "1"],
      ]),
    );

    expect(courseDatabase.from).toHaveBeenCalledWith("courses");
    expect(redirectMock).toHaveBeenLastCalledWith(
      `/matriculas/cursos/${courseId}?created=1&demo=1`,
    );

    const classDefaults = getCourseClassDemoDefaults(
      new Date("2026-07-13T12:00:00.000Z"),
    );
    const courseLookup = createLookupClient(courseId);
    const classDatabase = createInsertClient(classId);
    queueClient(courseLookup.client);
    queueClient(classDatabase.client);

    await createCourseClassAction(
      initialCourseClassFormState,
      formData([
        ["courseId", courseId],
        ["teacher", classDefaults.teacher],
        ["startDate", classDefaults.startDate],
        ["endDate", classDefaults.endDate],
        ["weekdays", "monday"],
        ["weekdays", "wednesday"],
        ["classTime", classDefaults.classTime],
        ["capacity", String(classDefaults.capacity)],
        ["demo", "1"],
      ]),
    );

    expect(courseLookup.from).toHaveBeenCalledWith("courses");
    expect(classDatabase.from).toHaveBeenCalledWith("course_classes");
    expect(redirectMock).toHaveBeenLastCalledWith(
      `/matriculas/turmas/${classId}?created=1&demo=1`,
    );

    const studentLookup = createLookupClient(studentId);
    const classLookup = createLookupClient(classId);
    const enrollmentDatabase = createInsertClient(enrollmentId);
    queueClient(studentLookup.client);
    queueClient(classLookup.client);
    queueClient(enrollmentDatabase.client);

    await createEnrollmentAction(
      initialEnrollmentFormState,
      formData([
        ["studentId", studentId],
        ["courseClassId", classId],
        ["status", "enrolled"],
        ["demo", "1"],
      ]),
    );

    expect(studentLookup.from).toHaveBeenCalledWith("students");
    expect(classLookup.from).toHaveBeenCalledWith("course_classes");
    expect(enrollmentDatabase.from).toHaveBeenCalledWith("enrollments");
    expect(redirectMock).toHaveBeenLastCalledWith(
      `/matriculas/inscricoes/${enrollmentId}?created=1&demo=1`,
    );

    const enrollmentLookup = createEnrollmentLookupClient();
    const attendanceDatabase = createAttendanceUpsertClient();
    queueClient(enrollmentLookup.client);
    queueClient(attendanceDatabase.client);

    await saveAttendanceAction(
      initialAttendanceFormState,
      formData([
        ["courseClassId", classId],
        ["classDate", "2026-07-20"],
        ["studentId", studentId],
        [`status:${studentId}`, "present"],
        ["demo", "1"],
        ["demoEnrollmentId", enrollmentId],
      ]),
    );

    expect(enrollmentLookup.from).toHaveBeenCalledWith("enrollments");
    expect(attendanceDatabase.from).toHaveBeenCalledWith("attendance_records");
    expect(attendanceDatabase.upsert).toHaveBeenCalledWith(
      [
        {
          class_date: "2026-07-20",
          course_class_id: classId,
          organization_id: organizationId,
          status: "present",
          student_id: studentId,
        },
      ],
      {
        onConflict: "organization_id,course_class_id,student_id,class_date",
      },
    );
    expect(redirectMock).toHaveBeenLastCalledWith(
      `/matriculas/frequencia?classId=${classId}&date=2026-07-20&saved=1&demo=1&enrollmentId=${enrollmentId}`,
    );

    const certificateClient = createCertificateClient();
    queueClient(certificateClient);

    const result = await getCertificateData({
      certificateDate: "2026-09-14",
      enrollmentId,
    });

    expect(certificateClient.from).toHaveBeenCalledWith("enrollments");
    expect(certificateClient.from).toHaveBeenCalledWith("students");
    expect(certificateClient.from).toHaveBeenCalledWith("course_classes");
    expect(certificateClient.from).toHaveBeenCalledWith("courses");
    expect(result.certificate).toEqual({
      courseName: courseDemoDefaults.name,
      date: "2026-09-14",
      schoolName: "Escola Horizonte",
      studentName: "Ana Souza",
      workloadHours: courseDemoDefaults.workloadHours,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/matriculas/frequencia",
    );
  });

  it("prepara uma turma futura com datas e dias coerentes", () => {
    expect(
      getCourseClassDemoDefaults(new Date("2026-07-13T12:00:00.000Z")),
    ).toEqual({
      capacity: 20,
      classTime: "19:00",
      endDate: "2026-09-14",
      startDate: "2026-07-20",
      teacher: "Camila Rocha",
      weekdays: ["monday", "wednesday"],
    });
  });
});
