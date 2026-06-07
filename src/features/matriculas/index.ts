import { GraduationCap } from "lucide-react";

export const matriculasModule = {
  key: "matriculas",
  name: "Matriculas",
  shortName: "Matriculas",
  href: "/matriculas",
  description: "Turmas, alunos e inscricoes para operacoes de cursos livres.",
  icon: GraduationCap,
  accent: "violet" as const,
  nextSteps: [
    "Cadastrar alunos e turmas",
    "Controlar vagas e inscricoes",
    "Acompanhar situacao da matricula",
  ],
};
