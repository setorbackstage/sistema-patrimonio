"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import JsBarcode from "jsbarcode"
import { LabelConfig } from "@/lib/label-templates"

interface AssetLabelProps {
  asset: {
    patrimonyNumber: string
    description: string
    category?: { name: string; code: string } | null
    room?: { name: string; floor?: { name: string; building?: { name: string } } } | null
  }
  config: LabelConfig
  className?: string
  scale?: number
}

export function PatrimonioLabel({
  asset,
  config,
  className = "",
  scale = 1,
}: AssetLabelProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const barcodeRef = useRef<SVGSVGElement>(null)

  // Gerar QR Code
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const publicUrl = `${origin}/patrimonio/${encodeURIComponent(asset.patrimonyNumber)}`

    QRCode.toDataURL(publicUrl, {
      width: 250,
      margin: 0,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(console.error)
  }, [asset.patrimonyNumber])

  // Gerar Código de Barras 1D (Code 128)
  useEffect(() => {
    if (barcodeRef.current && config.showBarcode) {
      try {
        const isSmall = config.size === "thermal-50x30" || config.size === "a4-pimaco-30"
        JsBarcode(barcodeRef.current, asset.patrimonyNumber, {
          format: "CODE128",
          width: isSmall ? 1.1 : 1.4,
          height: isSmall ? 18 : 26,
          displayValue: false,
          margin: 0,
          background: "transparent",
          lineColor: "#000000",
        })
      } catch (err) {
        console.error("Erro ao gerar código de barras:", err)
      }
    }
  }, [asset.patrimonyNumber, config.showBarcode, config.size])

  // Dimensões em milímetros para cada padrão (preview ~5.6px/mm)
  const dimensionsMap: Record<string, { widthMm: string; heightMm: string; previewW: string; previewH: string }> = {
    "thermal-50x30": { widthMm: "50mm", heightMm: "30mm", previewW: "280px", previewH: "168px" },
    "thermal-60x40": { widthMm: "60mm", heightMm: "40mm", previewW: "330px", previewH: "220px" },
    "thermal-100x50": { widthMm: "100mm", heightMm: "50mm", previewW: "460px", previewH: "230px" },
    "portable-40x30": { widthMm: "40mm", heightMm: "30mm", previewW: "224px", previewH: "168px" },
    "portable-40x20": { widthMm: "40mm", heightMm: "20mm", previewW: "224px", previewH: "112px" },
    "a4-pimaco-30": { widthMm: "66.7mm", heightMm: "25.4mm", previewW: "320px", previewH: "122px" },
  }

  const dim = dimensionsMap[config.size] || dimensionsMap["thermal-50x30"]

  return (
    <div
      className={`label-container bg-white text-black border-2 border-black rounded p-2 flex flex-col justify-between overflow-hidden select-none box-border shadow-sm print:shadow-none print:border-black print:rounded-none ${className}`}
      style={{
        width: dim.previewW,
        height: dim.previewH,
        maxWidth: "100%",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* ──────────────────────────────────────────────────
          LAYOUT 1: TÉRMICA 50mm x 30mm (PADRÃO SEEDUC)
          Layout em 2 colunas para máximo aproveitamento
      ────────────────────────────────────────────────── */}
      {config.size === "thermal-50x30" && (
        <div className="h-full flex flex-col justify-between text-black">
          {/* Topo institucional */}
          {config.showSchoolName && (
            <div className="flex items-center justify-between border-b border-black pb-0.5 mb-1 leading-none">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-black">
                CIEP 395 • SEEDUC-RJ
              </span>
              <span className="text-[7px] font-bold text-gray-700 uppercase">
                U.A. 180866
              </span>
            </div>
          )}

          {/* Grid Central: QR Code à esquerda + Informações e Barcode à direita */}
          <div className="flex items-center gap-2 flex-1 min-h-0">
            {config.showQrCode && qrCodeDataUrl && (
              <div className="shrink-0 flex flex-col items-center">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-16 h-16 border border-black p-0.5 bg-white object-contain"
                />
                <span className="text-[6px] font-black tracking-tighter uppercase text-gray-600 mt-0.5">
                  SCAN ME
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
              <div>
                <span className="text-[7px] font-bold uppercase tracking-widest text-gray-600 block leading-none">
                  PATRIMÔNIO Nº
                </span>
                <span className="text-base font-black font-mono tracking-tight text-black block leading-tight">
                  {asset.patrimonyNumber}
                </span>

                {config.showDescription && (
                  <p className="text-[8px] font-semibold text-gray-900 line-clamp-1 leading-tight mt-0.5">
                    {asset.description}
                  </p>
                )}
              </div>

              {/* Código de barras 1D Code128 */}
              {config.showBarcode && (
                <div className="w-full flex flex-col items-center mt-0.5">
                  <svg ref={barcodeRef} className="w-full max-h-5 object-contain" />
                  <span className="text-[6.5px] font-mono font-bold tracking-widest text-gray-800 leading-none">
                    *{asset.patrimonyNumber}*
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          LAYOUT 2: TÉRMICA 60mm x 40mm (GRANDE)
      ────────────────────────────────────────────────── */}
      {config.size === "thermal-60x40" && (
        <div className="h-full flex flex-col justify-between text-black">
          {/* Cabeçalho */}
          {config.showSchoolName && (
            <div className="text-center border-b border-black pb-1 mb-1 leading-none">
              <p className="text-[10px] font-black uppercase tracking-wider text-black">
                CIEP 395 - LUIZ HENRIQUE REZENDE NOVAES
              </p>
              <p className="text-[7.5px] font-bold text-gray-700 mt-0.5">
                GOVERNO DO ESTADO DO RIO DE JANEIRO • SEEDUC-RJ
              </p>
            </div>
          )}

          {/* Meio: QR Code + Dados do Patrimônio */}
          <div className="flex items-center gap-2.5 flex-1 min-h-0">
            {config.showQrCode && qrCodeDataUrl && (
              <div className="shrink-0 flex flex-col items-center">
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code"
                  className="w-20 h-20 border border-black p-0.5 bg-white object-contain"
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <span className="text-[7.5px] font-bold uppercase tracking-wider text-gray-600 block">
                Nº DE TOMBAMENTO
              </span>
              <span className="text-lg font-black font-mono tracking-tight text-black block leading-none">
                {asset.patrimonyNumber}
              </span>

              {config.showDescription && (
                <p className="text-[9px] font-semibold text-gray-900 line-clamp-2 leading-tight mt-1">
                  {asset.description}
                </p>
              )}

              {asset.room && (
                <p className="text-[7.5px] font-bold text-blue-800 mt-0.5 truncate">
                  📍 {asset.room.name}
                </p>
              )}
            </div>
          </div>

          {/* Código de barras 1D Code 128 */}
          {config.showBarcode && (
            <div className="pt-1 mt-1 border-t border-gray-300 flex flex-col items-center">
              <svg ref={barcodeRef} className="w-full max-h-6 object-contain" />
              <span className="text-[7.5px] font-mono font-bold tracking-widest text-gray-800">
                *{asset.patrimonyNumber}*
              </span>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          LAYOUT 3: TÉRMICA 100mm x 50mm (INDUSTRIAL)
      ────────────────────────────────────────────────── */}
      {config.size === "thermal-100x50" && (
        <div className="h-full flex flex-col justify-between text-black">
          {/* Cabeçalho */}
          {config.showSchoolName && (
            <div className="flex items-center justify-between border-b-2 border-black pb-1 mb-1">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-black leading-tight">
                  CIEP 395 - LUIZ HENRIQUE REZENDE NOVAES
                </p>
                <p className="text-[8px] font-bold text-gray-700 leading-tight">
                  SECRETARIA DE ESTADO DE EDUCAÇÃO DO RIO DE JANEIRO
                </p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black bg-black text-white px-1.5 py-0.5 rounded">
                  U.A. 180866
                </span>
              </div>
            </div>
          )}

          {/* Meio: QR Code + Detalhes */}
          <div className="flex items-center gap-3 flex-1 min-h-0">
            {config.showQrCode && qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="w-24 h-24 border-2 border-black p-0.5 bg-white shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600 block">
                Nº DE CONTROLE PATRIMONIAL
              </span>
              <span className="text-2xl font-black font-mono tracking-tight text-black block">
                {asset.patrimonyNumber}
              </span>

              {config.showDescription && (
                <p className="text-[10px] font-semibold text-gray-900 line-clamp-2 leading-tight mt-1">
                  {asset.description}
                </p>
              )}

              {asset.category && (
                <p className="text-[8px] font-medium text-gray-600 mt-0.5">
                  SIAF: {asset.category.code} - {asset.category.name}
                </p>
              )}
            </div>
          </div>

          {/* Barcode 1D */}
          {config.showBarcode && (
            <div className="pt-1 mt-1 border-t border-black flex flex-col items-center">
              <svg ref={barcodeRef} className="w-full max-h-7 object-contain" />
              <span className="text-[8px] font-mono font-bold tracking-widest text-gray-800">
                *{asset.patrimonyNumber}*
              </span>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          LAYOUT 4: PORTÁTIL BLUETOOTH 40mm x 30mm (NIIMBOT/PHOMEMO)
          QR + nº de tombamento — otimizado pra 203dpi
      ────────────────────────────────────────────────── */}
      {(config.size === "portable-40x30" || config.size === "portable-40x20") && (
        <div className="h-full flex items-center gap-1.5 text-black">
          {config.showQrCode && qrCodeDataUrl && (
            <img
              src={qrCodeDataUrl}
              alt="QR Code"
              className={`${config.size === "portable-40x20" ? "w-12 h-12" : "w-16 h-16"} border border-black p-0.5 bg-white shrink-0 object-contain`}
            />
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
            <span className="text-[6px] font-black uppercase tracking-wider text-black leading-none">
              CIEP 395 • SEEDUC
            </span>
            <span className="text-[13px] font-black font-mono tracking-tight text-black leading-tight">
              {asset.patrimonyNumber}
            </span>
            {config.showDescription && config.size === "portable-40x30" && (
              <p className="text-[6.5px] font-semibold text-gray-900 line-clamp-2 leading-tight">
                {asset.description}
              </p>
            )}
            {config.showBarcode && (
              <div className="w-full flex flex-col items-start">
                <svg ref={barcodeRef} className="w-full max-h-4 object-contain" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────
          LAYOUT 5: FOLHA A4 PIMACO (30 ETIQUETAS)
      ────────────────────────────────────────────────── */}
      {config.size === "a4-pimaco-30" && (
        <div className="h-full flex items-center gap-2 text-black">
          {config.showQrCode && qrCodeDataUrl && (
            <img
              src={qrCodeDataUrl}
              alt="QR"
              className="w-14 h-14 border border-black p-0.5 bg-white shrink-0"
            />
          )}

          <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
            <div className="flex items-center justify-between border-b border-black pb-0.5 leading-none">
              <span className="text-[7.5px] font-black uppercase text-black">
                CIEP 395 • SEEDUC
              </span>
              <span className="text-xs font-black font-mono text-black">
                {asset.patrimonyNumber}
              </span>
            </div>

            {config.showDescription && (
              <p className="text-[7px] font-semibold text-gray-900 line-clamp-1 leading-tight my-0.5">
                {asset.description}
              </p>
            )}

            {config.showBarcode && (
              <div className="w-full flex flex-col items-center">
                <svg ref={barcodeRef} className="w-full max-h-4 object-contain" />
                <span className="text-[5.5px] font-mono font-bold text-gray-700 leading-none">
                  *{asset.patrimonyNumber}*
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
