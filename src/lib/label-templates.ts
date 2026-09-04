// ==============================================
// MODELOS E CONFIGURAÇÕES DE ETIQUETAS PATRIMONIAIS
// ==============================================

export interface LabelConfig {
  size: "pt260-48x30" | "thermal-58x40" | "thermal-50x30" | "thermal-60x40" | "thermal-100x50" | "portable-40x30" | "portable-40x20" | "a4-pimaco-30"
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
    id: "pt260-48x30",
    name: "PT-260 / BaiHuo 48mm x 30mm (USB no PC)",
    description: "Largura exata da cabeça da PT-260 (48mm) — não corta QR nem código de barras. Use com etiquetas 58x40 ou 50x30.",
    widthMm: 48,
    heightMm: 30,
    isThermal: true,
  },
  {
    id: "thermal-58x40",
    name: "Térmica 58mm x 40mm (BaiHuo / rolos 58mm)",
    description: "Padrão de impressoras térmicas de 58mm (BaiHuo MY-7565, Goojprt, Xprinter). 1 etiqueta por linha.",
    widthMm: 58,
    heightMm: 40,
    isThermal: true,
  },
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
