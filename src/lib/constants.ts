// Constantes do sistema
export const APP_NAME = "SisPatrimônio"
export const APP_DESCRIPTION = "Sistema de Gestão Patrimonial"
export const ORGANIZATION_NAME = "CIEP 395 – Luiz Henrique Rezende Novaes"
export const ORGANIZATION_FULL = "GOVERNO DO ESTADO DO RIO DE JANEIRO – SECRETARIA DE ESTADO DE EDUCAÇÃO"

// Status do patrimônio com labels e cores
export const ASSET_STATUS_MAP = {
  ACTIVE: { label: "Ativo", color: "success" as const },
  INACTIVE: { label: "Inativo", color: "secondary" as const },
  DISPOSED: { label: "Baixado", color: "danger" as const },
  TRANSFERRED: { label: "Transferido", color: "info" as const },
  LOST: { label: "Extraviado", color: "danger" as const },
  UNDER_MAINTENANCE: { label: "Em manutenção", color: "warning" as const },
}

// Condição do patrimônio
export const ASSET_CONDITION_MAP = {
  EXCELLENT: { label: "Excelente", color: "success" as const },
  GOOD: { label: "Bom", color: "success" as const },
  REGULAR: { label: "Regular", color: "warning" as const },
  BAD: { label: "Ruim", color: "warning" as const },
  DAMAGED: { label: "Danificado", color: "danger" as const },
  SCRAPPED: { label: "Sucateado", color: "danger" as const },
  NOT_EVALUATED: { label: "Não avaliado", color: "secondary" as const },
}

// Status da etiqueta
export const LABEL_STATUS_MAP = {
  NOT_GENERATED: { label: "Não gerada", color: "secondary" as const },
  GENERATED: { label: "Gerada", color: "info" as const },
  PRINTED: { label: "Impressa", color: "default" as const },
  APPLIED: { label: "Aplicada", color: "success" as const },
  DAMAGED_LABEL: { label: "Danificada", color: "danger" as const },
  REPLACED: { label: "Substituída", color: "warning" as const },
}

// Status do ciclo de inventário
export const INVENTORY_STATUS_MAP = {
  OPEN: { label: "Aberto", color: "secondary" as const },
  IN_PROGRESS: { label: "Em Andamento", color: "info" as const },
  COMPLETED: { label: "Concluído", color: "success" as const },
  CANCELLED: { label: "Cancelado", color: "danger" as const },
}

// Status dos itens do inventário
export const INVENTORY_ITEM_STATUS_MAP = {
  CONFERRED: { label: "Conferido", color: "success" as const },
  DIVERGENT: { label: "Divergente / Fora da Sala", color: "warning" as const },
  MISSING: { label: "Pendente / Faltante", color: "danger" as const },
  NOT_CHECKED: { label: "Não conferido", color: "secondary" as const },
  FOUND: { label: "Encontrado", color: "success" as const },
}

// Resultado do inventário
export const INVENTORY_RESULT_MAP = {
  NOT_CHECKED: { label: "Não conferido", color: "secondary" as const },
  FOUND: { label: "Encontrado", color: "success" as const },
  NOT_FOUND: { label: "Não encontrado", color: "danger" as const },
  DIVERGENT: { label: "Divergente", color: "warning" as const },
  DAMAGED: { label: "Danificado", color: "danger" as const },
  NO_LABEL: { label: "Sem etiqueta", color: "warning" as const },
  MOVED: { label: "Movimentado", color: "info" as const },
}

// Tipo de sala
export const ROOM_TYPE_MAP: Record<string, { label: string }> = {
  CLASSROOM: { label: "Sala de aula" },
  SECRETARY: { label: "Secretaria" },
  PRINCIPAL_OFFICE: { label: "Diretoria" },
  COORDINATION: { label: "Coordenação" },
  TEACHERS_ROOM: { label: "Sala dos professores" },
  LABORATORY: { label: "Laboratório" },
  COMPUTER_LAB: { label: "Laboratório de informática" },
  STORAGE: { label: "Almoxarifado" },
  LIBRARY: { label: "Biblioteca" },
  KITCHEN: { label: "Cozinha" },
  CAFETERIA: { label: "Refeitório" },
  DEPOSIT: { label: "Depósito" },
  PATIO: { label: "Pátio" },
  BATHROOM: { label: "Banheiro" },
  CORRIDOR: { label: "Corredor" },
  AUDITORIUM: { label: "Auditório" },
  SPORTS_COURT: { label: "Quadra esportiva" },
  INFIRMARY: { label: "Enfermaria" },
  OTHER: { label: "Outros" },
}

// Perfis de usuário
export const USER_ROLE_MAP = {
  ADMIN: { label: "Administrador", description: "Acesso total ao sistema" },
  MANAGER: { label: "Gestor", description: "Consultar, cadastrar, movimentar e inventariar" },
  OPERATOR: { label: "Operador", description: "Conferência e consulta de patrimônios" },
  VIEWER: { label: "Consulta", description: "Somente visualização" },
}

// Categorias SIAF pré-mapeadas
export const SIAF_CATEGORIES: Record<string, string> = {
  "1.2.3.1.1.01.02": "Aparelhos de Medição e Orientação",
  "1.2.3.1.1.01.04": "Aparelhos e Utensílios Pedagógicos",
  "1.2.3.1.1.01.05": "Equipamentos Esportivos e de Lazer",
  "1.2.3.1.1.01.06": "Aparelhos e Equipamentos de Climatização",
  "1.2.3.1.1.01.12": "Equipamentos de Proteção e Segurança",
  "1.2.3.1.1.01.13": "Instrumentos Musicais e Artísticos",
  "1.2.3.1.1.01.15": "Equipamentos de Energia e Proteção Elétrica",
  "1.2.3.1.1.01.16": "Máquinas e Equipamentos de Escritório",
  "1.2.3.1.1.01.17": "Equipamentos de Informática",
  "1.2.3.1.1.01.18": "Equipamentos Audiovisuais",
  "1.2.3.1.1.01.19": "Veículos e Componentes",
  "1.2.3.1.1.01.20": "Equipamentos Hidráulicos e Elétricos",
  "1.2.3.1.1.01.21": "Outros Equipamentos",
  "1.2.3.1.1.01.23": "Mobiliário em Geral",
  "1.2.3.1.1.01.38": "Conjuntos e Kits Especiais",
}
