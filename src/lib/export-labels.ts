"use client"

import { toPng } from "html-to-image"

// Resolução nativa da cabeça de impressão térmica: 203 dpi
const THERMAL_DPI = 203
const MM_PER_INCH = 25.4

/**
 * Exporta um nó DOM (a etiqueta renderizada) como PNG na resolução
 * exata da impressora térmica (203 dpi), pronto para abrir no app
 * da impressora portátil Bluetooth (NIIMBOT / Phomemo / etc).
 */
export async function exportLabelAsPng(
  node: HTMLElement,
  widthMm: number,
  heightMm: number,
  filename: string,
): Promise<void> {
  const targetPxW = Math.round((widthMm / MM_PER_INCH) * THERMAL_DPI)
  const targetPxH = Math.round((heightMm / MM_PER_INCH) * THERMAL_DPI)

  const currentW = node.offsetWidth || targetPxW
  const pixelRatio = targetPxW / currentW

  const dataUrl = await toPng(node, {
    pixelRatio,
    width: targetPxW,
    height: targetPxH,
    backgroundColor: "#ffffff",
    cacheBust: true,
  })

  const link = document.createElement("a")
  link.download = `${filename}.png`
  link.href = dataUrl
  link.click()
}

/**
 * Exporta várias etiquetas como PNGs nomeados (000001.png, 000002.png...).
 * Retorna a contagem de arquivos gerados.
 */
export async function exportLabelsAsPng(
  nodes: { el: HTMLElement; filename: string }[],
  widthMm: number,
  heightMm: number,
): Promise<number> {
  let count = 0
  for (const { el, filename } of nodes) {
    try {
      await exportLabelAsPng(el, widthMm, heightMm, filename)
      count++
      // pequeno intervalo para o navegador processar cada download
      await new Promise((r) => setTimeout(r, 250))
    } catch (err) {
      console.error(`Falha ao exportar ${filename}:`, err)
    }
  }
  return count
}
