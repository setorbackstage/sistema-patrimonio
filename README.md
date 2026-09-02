# 🏛️ SisPatrimônio — CIEP 395 Luiz Henrique Rezende Novaes

Sistema Web Completo de **Gestão, Inventário, Etiquetagem e Localização Física de Patrimônio**, desenvolvido exclusivamente para a unidade escolar **CIEP 395 Luiz Henrique Rezende Novaes** (SEEDUC-RJ, U.A. 180866).

---

## 🚀 Principais Funcionalidades

### 1. 📊 Importação Inteligente de Planilhas (Excel / XLSX)
- Importador automático compatível com o formato oficial **Anexo IV da SEEDUC-RJ** (Instrução Normativa nº 41/2017).
- Assistente em 4 etapas: **Upload Drag & Drop → Pré-visualização com Validação de Linhas → Processamento com Auditoria → Relatório de Resultados**.
- Deduplicação automática por número de tombamento e normalização de descrições e observações.

### 2. 🏷️ Estação de Etiquetagem e Impressão Responsiva
- **Impressão Térmica**: Formatos 50x30mm (padrão 2 colunas), 60x40mm (ampliado) e 100x50mm (industrial) compatíveis com impressoras Zebra, Argox, Elgin, Bematech.
- **Impressão em Folha A4 (Pimaco)**: Folha padrão de 30 etiquetas (3x10).
- **Código de Barras Duplo**: QR Code oficial de alta resolução + Código de Barras 1D (Code128).
- **Impressão em Lote**: Impressão direta de todos os bens de uma sala ou selecionados na tabela.

### 3. 📱 Consulta Pública por QR Code
- Ao apontar a câmera de qualquer smartphone para a etiqueta física colada no bem, abre instantaneamente a página pública (`/patrimonio/[numero]`) com os dados oficiais e localização sem necessidade de login.

### 4. 🏢 Localização Física Detalhada (Prédio → Andar → Sala)
- Estrutura física completa do CIEP 395 com visualização em árvore.
- **Alocação Rápida em 1 Clique**: Vincule salas diretamente na tabela de patrimônios.
- **Alocação em Lote**: Selecione múltiplos itens e defina o prédio, andar e sala em segundos.
- Gestão e exclusão segura de salas.

### 5. 📋 Inventário Físico em Tempo Real (Desktop & Mobile)
- **Leitura Rápida Desktop**: Suporte nativo a leitores de código de barras USB/Bluetooth.
- **Leitura Mobile**: Leitor de QR Code integrado via câmera do smartphone.
- **Feedback Sonoro & Visual**: Alertas sonoros (sucesso, divergência de sala e não cadastrado).
- **Conciliação Automática**: Contagem em tempo real de itens conferidos e faltantes.

### 6. 🔐 Autenticação Segura & Registro de Usuários
- Login (`/login`) e Auto-registro (`/register`) com sessões JWT seguras via cookies HTTP-only.
- Gestão completa de usuários na área administrativa (`/admin/usuarios`).

---

## 🔑 Credenciais Pré-configuradas

| Usuário | Email de Acesso | Senha | Função |
|---|---|---|---|
| **Diogo Peçanha (Criador / Admin)** | `setorbackstage@gmail.com` | `02122024Dn@` | `ADMIN` (Acesso Total) |
| **Diretoria Geral (CIEP 395)** | `diretoria@ciep395.edu.br` | `ciep395diretoria` | `ADMIN` (Acesso Total) |
| **Administrador TI** | `admin@ciep395.edu.br` | `admin123` | `ADMIN` |
| **Agente de Patrimônio** | `operador@ciep395.edu.br` | `operador123` | `OPERATOR` |

---

## 🌐 Como Configurar na Vercel (Passo a Passo)

### 1. Importar o Repositório no Painel da Vercel
- Conecte sua conta do GitHub na Vercel.
- Selecione o repositório `sistema-patrimonio`.
- **Root Directory**: Deixe `./` (a raiz do projeto).
- **Framework Preset**: Next.js (detectado automaticamente).

### 2. Adicionar as Variáveis de Ambiente (Environment Variables)
No painel da Vercel (**Settings ➔ Environment Variables**), adicione:

| Nome da Variável | Valor |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:ktKdSi4Sogjuecbc@db.tsysjcurvxzfzflpafkw.supabase.co:5432/postgres` |
| `AUTH_SECRET` | `ciep395-patrimonio-secure-key-2026-seeduc` |

### 3. Deploy
Clique no botão **Deploy** ou faça um novo commit para a branch `main`. A Vercel executará o build automaticamente e publicará o sistema online!

---

## 💻 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install

# 2. Executar em modo desenvolvimento
npm run dev

# 3. Ou compilar e rodar versão de produção
npm run build
npm run start
```
Acesse: [http://localhost:3000](http://localhost:3000)

---

**Desenvolvido para o CIEP 395 Luiz Henrique Rezende Novaes • SEEDUC-RJ**
