// ==============================================
// MODELOS E CONFIGURAÇÕES DE ETIQUETAS PATRIMONIAIS
// ==============================================

export interface LabelConfig {
  size: "thermal-50x30" | "thermal-60x40" | "thermal-100x50" | "portable-40x30" | "portable-40x20" | "a4-pimaco-30"
  showSchoolName: boolean
  showDescription: boolean
  showQrCode: boolean
  showBarcode: boolean
  schoolHeader: string
}

export const DEFAULT_LABEL_CONFIG: LabelConfig = {
  size: "thermal-50x30",
  showSchoolName: true,
  showDescription: true,
  showQrCode: true,
  showBarcode: true,
  schoolHeader: "CIEP 395 • SEEDUC-RJ",
}

export const LABEL_SIZES = [
  {
    id: "thermal-50x30",
    name: "Térmica 50mm x 30mm (Padrão)",
    description: "Ideal para rolos de etiquetas de impressoras térmicas (Zebra, Argox, Elgin)",
    widthMm: 50,
    heightMm: 30,
    isThermal: true,
  },
  {
    id: "thermal-60x40",
    name: "Térmica 60mm x 40mm (Grande)",
    description: "Espaço ampliado para descrição longa e QR code maior",
    widthMm: 60,
    heightMm: 40,
    isThermal: true,
  },
  {
    id: "thermal-100x50",
    name: "Térmica 100mm x 50mm (Industrial)",
    description: "Para grandes equipamentos e placas metálicas",
    widthMm: 100,
    heightMm: 50,
    isThermal: true,
  },
  {
    id: "portable-40x30",
    name: "Portátil Bluetooth 40mm x 30mm",
    description: "Rolo padrão de impressoras portáteis (NIIMBOT B21/B1, Phomemo T02). Exporte como PNG e imprima pelo app.",
    widthMm: 40,
    heightMm: 30,
    isThermal: true,
  },
  {
    id: "portable-40x20",
    name: "Portátil Bluetooth 40mm x 20mm",
    description: "Etiqueta compacta para rolos de 40x20mm (NIIMBOT, Phomemo). Exporte como PNG e imprima pelo app.",
    widthMm: 40,
    heightMm: 20,
    isThermal: true,
  },
  {
    id: "a4-pimaco-30",
    name: "Folha A4 Pimaco (30 etiquetas)",
    description: "Impressora comum jato de tinta ou laser (Folhas Pimaco 6180 / 6080 - 3x10)",
    widthMm: 66.7,
    heightMm: 25.4,
    isThermal: false,
  },
]
