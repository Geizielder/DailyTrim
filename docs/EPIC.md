# 🌟 Épico – DailyTrim

## Visão
O DailyTrim é um app de produtividade **offline-first** focado em tarefas e gestão de tempo.  
Funciona como um **Task Manager minimalista**, mas com base sólida em tecnologias modernas, garantindo organização e escalabilidade desde o início.

## Objetivo
Fornecer uma ferramenta **simples, rápida e multiplataforma**, que rode localmente via **Tauri + PocketBase + React + Rust**.  
O diferencial não está nas features (já existem muitas apps de tasks), mas na **arquitetura limpa, TDD e documentação viva**.

---

## Use Cases

### UC1 – Criar Tarefa
- Usuário cria tarefa com título, prioridade e status inicial.  
- Persistência local no PocketBase.

### UC2 – Atualizar Status
- Mover tarefa entre `todo`, `doing`, `done`.  

### UC3 – Timer
- Iniciar/pausar timer por tarefa.  
- [x] Timer básico” como iniciado/implementado.
- Timer controlado pelo backend Rust.  
- Persistência do tempo gasto no PB.  

### UC4 – Observações
- Editor Markdown para observações ligadas a cada tarefa.  

### UC5 – Dashboard
- Lista de tarefas com filtros e labels.  

### UC6 – Autenticação
- Autenticação local (PB users).  
- Sessão persistida.

---

## Requisitos Técnicos
- **Frontend**: React + TypeScript + Tailwind.  
- **Backend**: Tauri (Rust).  
- **Banco local**: PocketBase (SQLite).  
- **Testes**: Jest + Cargo test.  
- **Versionamento**: SemVer + Gitflow simplificado.  
- **CI/CD**: GitHub Actions.  
