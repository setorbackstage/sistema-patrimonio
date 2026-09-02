# 🏛️ SisPatrimônio — CIEP 395 Luiz Henrique Rezende Novaes

Sistema Web Completo de **Gestão, Inventário, Etiquetagem e Localização Física de Patrimônio**, desenvolvido exclusivamente para a unidade escolar **CIEP 395 Luiz Henrique Rezende Novaes** (SEEDUC-RJ).

---

## 🚀 Principais Funcionalidades

### 1. 📊 Importação Inteligente de Planilhas (Excel / XLSX)
- Importador automático compatível com o formato oficial **Anexo IV da SEEDUC-RJ** (Instrução Normativa nº 41/2017).
- Assistente em 4 etapas: **Upload Drag & Drop → Pré-visualização com Validação de Linhas → Processamento com Auditoria → Relatório de Resultados**.
- Deduplicação automática por número de tombamento e normalização de descrições e observações.

### 2. 🏷️ Estação de Etiquetagem e Impressão
- **Impressão Térmica**: Formatos 50x30mm (padrão), 60x40mm (ampliado) e 100x50mm (industrial) compatíveis com impressoras Zebra, Argox, Elgin, Bematech.
- **Impressão em Folha A4 (Pimaco)**: Folha padrão de 30 etiquetas (3x10).
- **Código de Barras Duplo**: QR Code oficial de alta resolução + Código de Barras 1D (Code128).
- **Impressão em Lote**: Impressão direta de todos os bens de uma sala ou de bens pendentes de etiquetagem.

### 3. 📱 Página Pública de Consulta por QR Code
- Ao apontar a câmera de qualquer smartphone para a etiqueta física colada no bem, abre instantaneamente a página pública (`/patrimonio/[numero]`) com os dados oficiais, localização física (Prédio, Andar, Sala) e dados da escola, sem necessidade de login.

### 4. 🏢 Localização Física Detalhada (Prédio → Andar → Sala)
- Estrutura física completa do CIEP 395 com visualização em árvore.
- Consulta de todos os bens alocados dentro de uma sala específica com valor total alocado e contagem de itens.
- Cadastro e edição dinâmica de novas salas e ambientes.

### 5. 🔄 Movimentação e Histórico de Bens
- Transferência assistida de patrimônio entre salas/prédios.
- Histórico completo e imutável de todas as movimentações com data, responsável e motivo.

### 6. 📋 Inventário Físico em Tempo Real (Desktop & Mobile)
- **Leitura Rápida Desktop**: Suporte nativo a leitores de código de barras USB com auto-focus contínuo.
- **Leitura Mobile**: Leitor de QR Code integrado via câmera do smartphone.
- **Feedback Sonoro & Visual**: Alertas sonoros (bip verde de sucesso, bip amarelo de divergência de sala, bip vermelho para não cadastrado).
- **Conciliação Automática**: Contagem em tempo real de itens conferidos, itens faltantes e itens fora da sala de origem.

### 7. 📑 Relatórios Oficiais e Exportação
- Demonstrativo por Classificação SIAF (código contábil, quantidade de itens, valor total e % do acervo).
- Demonstrativo por Localização / Sala.
- Demonstrativo por Estado de Conservação e Status Operacional.
- **Exportação para Excel (.xlsx)** no padrão exato da SEEDUC-RJ.
- **Impressão e PDF Oficial** formatado para auditoria.

### 8. 🔐 Segurança e Controle de Acesso (RBAC)
- Autenticação corporativa via **NextAuth v5** com hash de senha bcrypt.
- Perfis de acesso: **Administrador (ADMIN)**, **Operador (OPERATOR)**, **Auditor (AUDITOR)** e **Somente Leitura (VIEWER)**.
- Trilha de auditoria (`AuditLog`) registrando todas as ações críticas.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend & Backend**: Next.js 15 (App Router, Server Components, Server Actions, Route Handlers)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS com Design System corporativo em Inter
- **Banco de Dados**: PostgreSQL (hospedado no Neon Serverless)
- **ORM**: Prisma ORM v5
- **Autenticação**: NextAuth v5 (Beta)
- **Manipulação de Planilhas**: SheetJS (XLSX)
- **Códigos de Barra & QR**: QRCode + JsBarcode + HTML5-QRCode
- **Ícones**: Lucide React

---

## ⚙️ Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
cd patrimonio
npm install
```

### 2. Configurar o Banco de Dados (.env)
Crie um arquivo `.env` na pasta `patrimonio` com sua string de conexão do PostgreSQL (Neon):
```env
DATABASE_URL="postgresql://usuario:senha@ep-exemplo.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="gerar-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Sincronizar o Esquema do Banco
```bash
npm run db:push
```

### 4. Popular o Banco com Dados Iniciais (Seed)
```bash
npm run db:seed
```

> **Credenciais do Administrador Padrão:**
> - **Email**: `admin@ciep395.edu.br`
> - **Senha**: `admin123`

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy na Vercel

1. Suba o código para o seu repositório no GitHub.
2. Na Vercel, importe o repositório selecionando o diretório `patrimonio`.
3. Adicione as Variáveis de Ambiente no painel da Vercel:
   - `DATABASE_URL`: URL do Neon PostgreSQL
   - `NEXTAUTH_SECRET`: Segredo aleatório (ex: `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: URL de produção na Vercel (ex: `https://patrimonio-ciep395.vercel.app`)
   - `AUTH_TRUST_HOST`: `true`
4. Clique em **Deploy**!

---

**Desenvolvido para o CIEP 395 Luiz Henrique Rezende Novaes • SEEDUC-RJ**
