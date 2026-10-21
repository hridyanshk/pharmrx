PharmRx Mini Project

Name: Hridyansh Kothari
Division: B3
Roll number: 2025300118
Course: UIUD

Code link:
https://github.com/hridyanshk/pharmrx

Deployment link:
https://pharmrx-production.up.railway.app/

About the project
PharmRx is a pharmacy management website with role-based sign-in,
medicine and batch inventory, patient records, prescriptions, and dispensing.
The deployed demonstration uses fictional sample records.

Technologies
React, TypeScript, Vite, Node.js, Express, and MySQL.
The website and database are hosted on Railway.

Included screenshots
01_login.jpg - Sign-in page
02_dashboard.jpg - Overview dashboard
03_medicines.jpg - Medicine catalogue
04_batch_inventory.jpg - Batch inventory
05_patients.jpg - Patient records
06_prescriptions.jpg - Prescription register
07_dispensing.jpg - Dispensing counter

Run locally
1. Install Node.js 22 or later and MySQL 8.
2. Download or clone the code repository.
3. From the project folder, install dependencies:
   npm --prefix backend ci
   npm --prefix frontend ci --legacy-peer-deps
4. Create a MySQL database, for example remix_pharmrx.
5. Copy backend/.env.example to backend/.env. Set DB_HOST, DB_PORT,
   DB_USER, DB_PASSWORD, DB_NAME, and a private JWT_SECRET.
   For the local demonstration, set DEMO_PASSWORD=PharmRxDemo!2026.
6. Initialize the database:
   npm --prefix backend run setup
7. On Windows, double-click run.bat.
   Open http://localhost:3000 in a browser.

Local demonstration accounts
admin@pharmrx.local
pharmacist@pharmrx.local
doctor@pharmrx.local
patient@pharmrx.local
patient2@pharmrx.local
Their initial local password is the DEMO_PASSWORD used during setup.
The hosted site uses a separate private password, not included here.

Screenshots were captured from the live deployment on 13 October 2026.
Railway hosting currently uses trial credit.
