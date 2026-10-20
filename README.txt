=============================================================
PHARMRX - COMPLETE NEW PC SETUP & MIGRATION GUIDE
=============================================================

CURRENT APP: See FEATURES.md for the new authenticated workspace,
demo sign-in accounts, database setup, feature scope, and validation.
On this PC, double-click run.bat. It can use the bundled Node.js
runtime without npm. MySQL must be running with backend/.env configured.

### STEP 1: PREREQUISITES ON THE NEW PC
1. Install Node.js (LTS version from nodejs.org).
2. Install MySQL Community Server & MySQL Workbench.

---

### STEP 2: PROJECT EXTRACTION
1. Unzip your project folder onto the new PC (e.g., C:\Users\YourName\app\).
2. Ensure your root folder contains:
   - /backend/ folder
   - /frontend/ folder
   - run.bat
   - README.md
   - db.sql

---

### STEP 3: DATABASE SETUP
1. Open MySQL Workbench.
2. Create and initialize your database by copying and running the consolidated SQL setup script into your query window.

---

### STEP 4: INSTALL DEPENDENCIES MANUALLY
Open Command Prompt (cmd) and run:

1. Backend packages:
   cd C:\path\to\your\app\backend
   npm install

2. Frontend packages (using legacy-peer-deps to bypass Vite/esbuild conflicts):
   cd C:\path\to\your\app\frontend
   npm install --legacy-peer-deps

---

### STEP 5: LAUNCH APPLICATION
1. Navigate back to your root folder.
2. Double-click "run.bat" to spin up both servers and open your browser automatically!
