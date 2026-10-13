# PharmRx — The Dispensary Ledger

PharmRx is a local college DBMS application. The working interface uses warm ivory surfaces, dark brown navigation, serif headings, and restrained red actions. Tables and workflows take priority over decoration.

## Run

Double-click `run.bat`, then visit http://localhost:3000. The launcher finds Node.js in your installation or the Codex runtime and runs the already-installed dependencies directly. Keep the launcher’s server windows open.

The backend runs at http://localhost:5000. `backend/.env` contains the database connection and JWT signing secret. Keep it private. `setup-app-user.sql` contains a local database credential and is excluded from Git.

For a fresh database, run `node setup.js` from the backend directory. It creates the original tables plus the normalized `rx_` tables, views, and demo accounts. It preserves existing demo passwords and existing records. Run `install-db-routines.sql` once from an administrator Workbench connection if the app account cannot create the trigger. The app checks the trigger before dispensing.

## Demo sign-in

All five local demo accounts initially use `PharmRxDemo!2026`:

| Account | Role |
| --- | --- |
| admin@pharmrx.local | Administrator |
| pharmacist@pharmrx.local | Pharmacist |
| doctor@pharmrx.local | Doctor |
| patient@pharmrx.local | Patient |
| patient2@pharmrx.local | Second patient, for access-control demonstrations |

Sign-in uses the database password hashes and an eight-hour signed session. The login screen can fill a demo account, but it does not bypass authentication. Demo accounts are local fixtures, not production credentials. Administrators can create additional accounts and link existing unlinked patient or doctor profiles.

Two fictional prescriptions are included: one pending review and one ready for dispensing. Their directions are demonstration text, not clinical guidance.

## Demonstration workflow

1. As admin/pharmacist, add a medicine, a supplier, and an unexpired batch. Enter a verified tax rate for the medicine; the app supplies no statutory default. Batch unit prices are **before tax**.
2. As a doctor, create a patient prescription with explicit dosage, frequency, duration, and quantity. Creating a prescription does not change stock.
3. As a pharmacist, mark the prescription reviewed and open Dispensing. Select batches; earliest expiry is suggested first. You may split quantities across batches, but quantities must match the reviewed prescription exactly.
4. Check safety and totals. Critical configured rules block dispensing. Non-critical warnings require a written acknowledgement. Confirming dispensing creates an invoice, deducts physical stock, completes the prescription, and schedules a follow-up for patients carrying elderly-care or high-risk flags.
5. As the patient, view the prescription, its dosage instructions, the invoice, and any follow-up. A patient cannot select another patient’s identity for requests, read another patient’s records, or modify inventory.

## Modules

- **Clinical:** Patients, doctors, prescriptions, dosage instructions, review status, authenticated roles.
- **Inventory and procurement:** Medicine/batch separation, supplier records, expiry and low-stock visibility, held quantities, stock adjustments with reasons and history, and Draft → Sent → Received or Cancelled purchase orders. Receipt is transactional and can only happen once.
- **Verification:** Patients upload PNG/JPEG/WebP prescriptions (up to 2 MB) and choose Pickup or Delivery. Staff transcribe verified directions, attach a doctor, and allocate stock by earliest expiry. Allocation holds stock without deducting it; rejection releases holds and cancels the linked prescription. Pickup/Delivery is a fulfillment preference; logistics are not integrated.
- **Billing:** Batch-aware checkout, server-calculated CGST/SGST and totals, per-line rounding in paise, printable invoice snapshots, invoice register, summary reports, and CSV export. No payment gateway is connected.
- **Safety:** Explicit patient/medicine allergy links, doctor instructions, configured sports restrictions, quantity limits over 30 days of recorded dispensing, and multi-medicine interaction rules. Other active prescription medicines are included in interaction matching. The database trigger independently blocks configured restricted medicines for flagged athletes.
- **Patient care:** Personal prescriptions, uploads, invoices, contact details, allergy/instruction records, refill reminders, and high-risk follow-up outcomes. Refill schedules are reminders and do not automatically prescribe, sell, or charge.

## Database objects

`backend/schema.sql` contains the normalized tables and three views: `View_Patient_Safety_Alerts`, `View_Patient_Overuse_Monitor`, and `View_Verification_Stock_Queue`. The allergy view uses explicit medicine links rather than marking every medicine as an allergen.

`install-db-routines.sql` installs `Before_Invoice_Item_Insert_Check_Athlete` and `Schedule_Followup_Checkup`. `backend/setup.js` can also install these when its account has the required privileges.

The new API is under `/api/clinical`. Legacy `/api` endpoints are restricted to authenticated administrators. The original React views are retained in the source, but `main.tsx` opens the new workspace.

## Scope and limits

This is a DBMS demonstration, not validated clinical decision support, official WADA certification, or a tax compliance product. Seeded medicines are fictional. Staff must enter and maintain rules and their sources. No alerts means **no configured match**, not proven safety. Allergy matching is medicine-specific; there is no ingredient ontology. Written “Specific Dose Limit” instructions require manual review. Quantity limits do not model strength, route, clinical context, or actual patient consumption.

Financial examples split configured GST into CGST and SGST. They do not implement interstate IGST, GST filings, discounts, returns, refunds, or legal invoice certification. Uploaded images are stored in MySQL for a local project; external file storage, delivery integrations, automatic reminders, and production deployment are not included.

## Validation

From `backend`, run `node --test tests/workflow.test.js`. Tests use uniquely tagged fixtures and remove only their own records. They cover patient isolation, permissions, prescription/stock separation, expired-stock rejection, critical rules, tax rounding, checkout retries, simultaneous quantity-limit checks, database-trigger enforcement, purchase-order receipt, reservations and rejection, refills, and follow-ups.

From `frontend`, run `node node_modules/typescript/bin/tsc --noEmit` and `node node_modules/vite/bin/vite.js build`.
