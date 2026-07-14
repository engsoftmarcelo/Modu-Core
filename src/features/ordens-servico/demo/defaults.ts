export const workOrderDemoCustomer = {
  company: "Residencial Oliveira",
  email: "cliente.demo.ordem@moducore.local",
  name: "Mariana Oliveira",
  notes: "Cliente preparado para a demo de ordens de servico.",
  phone: "(31) 98888-7766",
  segment: "Servicos residenciais",
  whatsapp: "(31) 98888-7766",
} as const;

export const workOrderDemoDefaults = {
  address: "Avenida Afonso Pena, 1500 - Centro, Belo Horizonte - MG",
  description:
    "O equipamento parou de refrigerar e apresenta ruido durante o funcionamento. Avaliar o problema, preparar o orcamento e executar o reparo apos a aprovacao.",
  serviceType: "Manutencao de ar-condicionado",
  status: "requested" as const,
  technicianName: "Carlos Lima",
} as const;
