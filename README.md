# 💊 PharmRx — Pharmacy & Prescription Management System

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://www.mysql.com/)

A full-stack clinical pharmacy management application built with **React 18**, **TypeScript**, **Express**, and **MySQL**. PharmRx connects patients, doctors, medicines, prescriptions, and point-of-sale dispensing into a unified, safety-first relational workflow.

🌐 **Live Demo:** [https://pharmrx-production.up.railway.app/](https://pharmrx-production.up.railway.app/)

---

## ⚡ Core Features

- **👨‍⚕️ Clinical Registry:** Maintain profiles for doctors, pharmacists, and patients with clinical risk flags (*Athlete, Elderly Care, Addiction Risk*).
- **📦 Smart Inventory & Batches:** Real-time stock counts, multi-batch expiry tracking, automated reorder thresholds, and audit adjustments.
- **📋 Frictionless Prescriptions:** Digital prescription drafting with automatic review progression, multi-item dosage directions, and linked doctor/patient records.
- **🛡️ Clinical Safety Engine:**
  - Multi-drug interaction screening
  - Rolling 30-day quantity limits
  - Athlete anti-doping restrictions (enforced via database triggers)
  - Severe allergy cross-checks prior to dispensing
- **🧾 POS & Dispensing:** Direct batch stock allocation, tax/GST calculations, receipt generation, and transaction undo history.
- **⏱️ System Reliability:** 30-minute automated checkpoints and one-click atomic state restoration.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express 5, JWT Authentication, bcryptjs |
| **Database** | MySQL 8.0+ / 26.7+ (InnoDB, Transactions, Foreign Keys, Triggers) |
| **Testing** | Node.js Native Test Runner (`node --test`) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 1. Clone & Configure Backend
```bash
git clone https://github.com/hridyanshk/pharmrx.git
cd pharmrx/backend

# Install dependencies
npm install

# Configure environment (.env)
cp .env.example .env
# Update DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env

# Initialize database schema & seed data
npm run setup
npm run seed:small

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 2. Configure & Start Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:3000)
npm run dev
```

---

## 🔑 Demo Credentials

All test accounts share password: `PharmRxDemo!2026`

| Role | Email | Access Scope |
|---|---|---|
| **Admin** | `admin@pharmrx.local` | Full system control, safety rules, audit history, checkpoints |
| **Pharmacist** | `pharmacist@pharmrx.local` | Dispensing, stock management, purchase orders, verifications |
| **Doctor** | `doctor@pharmrx.local` | Issue prescriptions, schedule refills, follow-ups |
| **Patient** | `patient@pharmrx.local` | Personal prescriptions, order history, upload scripts |

> *Tip: You can also use quick workspace switching directly from the login page without manual entry.*

---

## 🧪 Testing

Run backend test suites covering workflows, concurrency, rolling limits, and database triggers:
```bash
cd backend
npm test
```
All 8 test suites execute with native assertion verification.

---

## 📂 Project Structure

```text
pharmrx/
├── backend/
│   ├── config/          # MySQL connection pool
│   ├── middleware/      # JWT authentication & role authorization
│   ├── routes/          # Clinical, inventory, prescription, patient endpoints
│   ├── tests/           # Automated integration & safety test suites
│   ├── schema.sql       # Relational database schema & triggers
│   └── server.js        # Express application entrypoint
├── frontend/
│   ├── src/             # React components, workspaces & styles
│   └── vite.config.ts   # Vite bundler configuration
└── evidence/            # Automated test run proof & dataset snapshots
```

---

## 📄 License
ISC License © 2026 PharmRx.
