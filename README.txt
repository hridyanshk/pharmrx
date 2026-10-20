# 💊 PharmRx — Pharmacy & Prescription Management System

<p align="center">
  <strong>A Smart and Centralized Pharmacy Management Solution</strong>
  <br>
  Managing patients, doctors, medicine inventory, and prescriptions through a unified digital platform.
  <br><br>
  <a href="https://pharmrx-production.up.railway.app/">
    <strong>🌐 Live Demo</strong>
  </a>
</p>

---

## 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Problem Statement](#-problem-statement)
* [Project Objectives](#-project-objectives)
* [Key Features](#-key-features)
* [Application Modules](#-application-modules)
* [Technology Stack](#-technology-stack)
* [Database Design](#-database-design)
* [Entity–Relationship Diagram](#-entityrelationship-er-diagram)
* [Relational Schema](#-relational-schema)
* [Database Relationships](#-database-relationships)
* [Database Constraints](#-database-constraints)
* [Project Structure](#-project-structure)
* [Installation and Setup](#-installation-and-setup)
* [Database Setup](#-database-setup)
* [Example SQL Queries](#-example-sql-queries)
* [Application Screenshots](#-application-screenshots)
* [Future Enhancements](#-future-enhancements)
* [Limitations](#-limitations)
* [Contributing](#-contributing)
* [License](#-license)
* [Author](#-author)

---

## 🩺 About the Project

**PharmRx** is a pharmacy and prescription management application designed to organize essential pharmacy operations in a centralized system.

The application focuses on maintaining doctor profiles, patient records, medicine inventory, and prescription information. Its relational database connects these components so that prescriptions can be associated with the appropriate doctors and patients while individual medicines are recorded against each prescription.

The system uses a structured database design to reduce unnecessary data duplication, maintain relationships between records, and make information easier to manage.

### 🌐 Live Application

**Try PharmRx:** https://pharmrx-production.up.railway.app/

The application is deployed on Railway. The features available through the live demo depend on the current deployment.

---

## 🎯 Problem Statement

Traditional pharmacy record management can involve scattered information, repetitive data entry, and difficulty tracking medicines and prescriptions.

Managing doctors, patients, medicines, and prescriptions independently can make it harder to maintain consistency across records.

PharmRx addresses these challenges by providing a centralized application backed by a relational database.

### Challenges Addressed

* 📂 Maintaining separate patient and doctor records.
* 💊 Organizing medicine inventory information.
* 📋 Connecting prescriptions with the correct patients and doctors.
* 🔗 Maintaining relationships between prescriptions and their prescribed medicines.
* 🗃️ Storing dosage, frequency, duration, and quantity information for individual prescription items.
* 🔍 Making pharmacy information easier to retrieve and manage.

---

## 🎯 Project Objectives

The primary objectives of PharmRx are:

1. **Centralized Data Management:** Store doctor, patient, inventory, and prescription information in a structured database.
2. **Prescription Management:** Associate prescriptions with doctors and patients.
3. **Medicine Tracking:** Maintain medicine names, categories, batches, quantities, prices, and expiry dates.
4. **Relational Integrity:** Use primary keys and foreign keys to establish relationships between database tables.
5. **Structured Prescription Items:** Store medicine-specific instructions separately from the main prescription record.
6. **Maintainability:** Use a modular database structure that can be extended with additional features.
7. **Digital Record Keeping:** Provide a foundation for managing pharmacy information digitally.

---

## ✨ Key Features

| Feature                  | Description                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| 👨‍⚕️ Doctor Management  | Store doctor names, specializations, license numbers, and contact information.               |
| 🧑‍⚕️ Patient Management | Maintain patient details, contact information, addresses, and medical history.               |
| 💊 Medicine Inventory    | Store medicine names, categories, batch numbers, stock quantities, prices, and expiry dates. |
| 📋 Prescription Records  | Associate prescriptions with patients and doctors.                                           |
| 🧾 Prescription Items    | Record individual medicines and their dosage, frequency, duration, and quantity.             |
| 🔗 Relational Database   | Connect related records through primary keys and foreign keys.                               |
| 🛡️ Data Integrity       | Use database constraints to enforce uniqueness and valid record relationships.               |
| 🕒 Timestamps            | Record creation times for doctors, patients, inventory items, and prescriptions.             |

> **Note:** The table above describes the capabilities supported by the supplied database design. Actual user-interface features depend on the current application implementation.

---

## 🧩 Application Modules

PharmRx's database is organized into five primary modules.

### 1. 👨‍⚕️ Doctor Management

The `doctors` table stores information about medical professionals.

**Information maintained:**

* Doctor ID
* Name
* Specialization
* Medical license number
* Contact information
* Email address
* Record creation timestamp

**Important constraint:** Each doctor has a unique license number.

### 2. 🧑‍⚕️ Patient Management

The `patients` table stores patient information.

**Information maintained:**

* Patient ID
* Name
* Age
* Gender
* Contact information
* Address
* Medical history
* Record creation timestamp

The medical history field supports the storage of additional patient information as text.

### 3. 💊 Medicine Inventory

The `inventory` table maintains information about medicines.

**Information maintained:**

* Medicine or inventory record ID
* Medicine name
* Category
* Batch number
* Stock quantity
* Unit price
* Expiry date
* Record creation timestamp

The inventory structure provides a foundation for tracking stock and medicine details.

**Important:** Automatic stock deduction, expiry alerts, and batch-level stock management require additional application or database logic.

### 4. 📋 Prescription Management

The `prescriptions` table stores the main information associated with a prescription.

**Information maintained:**

* Prescription ID
* Patient ID
* Doctor ID
* Diagnosis
* Prescription status
* Prescription date
* Record creation timestamp

Each prescription references one patient and one doctor.

### 5. 🧾 Prescription Item Management

The `prescription_items` table stores the individual medicines associated with prescriptions.

**Information maintained:**

* Prescription item ID
* Prescription ID
* Medicine ID
* Dosage
* Frequency
* Duration
* Quantity

This structure allows one prescription to contain multiple medicine entries.

---

## 🛠️ Technology Stack

The following table identifies the technologies and infrastructure relevant to the project. Confirm the actual frontend, backend, and database versions against your repository before finalizing this section.

| Component       | Technology / Tool                  | Purpose                                    |
| --------------- | ---------------------------------- | ------------------------------------------ |
| Frontend        | Project-specific implementation    | User interface and application interaction |
| Backend         | Project-specific implementation    | Application logic and data operations      |
| Database        | MySQL-compatible relational schema | Structured storage and relationships       |
| Deployment      | Railway                            | Hosting of the live application            |
| Version Control | Git and GitHub                     | Source code management and collaboration   |

### Core Database Concepts Used

* Relational database management
* Entity–Relationship modeling
* Primary keys and foreign keys
* One-to-many relationships
* Associative entities
* Data integrity constraints
* Default values
* Automatic ID generation
* SQL data definition and manipulation

---

## 🗄️ Database Design

The PharmRx database consists of five tables.

| Table                | Primary Key | Purpose                                          |
| -------------------- | ----------- | ------------------------------------------------ |
| `doctors`            | `id`        | Stores doctor information                        |
| `patients`           | `id`        | Stores patient information                       |
| `inventory`          | `id`        | Stores medicine inventory records                |
| `prescriptions`      | `id`        | Stores prescription-level information            |
| `prescription_items` | `id`        | Stores individual medicines within prescriptions |

### Why Five Tables?

Each table represents a distinct entity.

Doctor information is stored separately from patient information, and medicine details are stored separately from prescriptions. The `prescription_items` table connects prescriptions with medicines.

This approach reduces repetitive storage and makes it possible to associate a prescription with multiple medicines without storing several medicine names in a single field.

---

## 🔄 Entity–Relationship (ER) Diagram

The following ER diagram represents the database relationships defined by the supplied SQL schema.

```mermaid
erDiagram
    DOCTORS ||--o{ PRESCRIPTIONS : issues
    PATIENTS ||--o{ PRESCRIPTIONS : receives
    PRESCRIPTIONS ||--o{ PRESCRIPTION_ITEMS : contains
    INVENTORY ||--o{ PRESCRIPTION_ITEMS : references

    DOCTORS {
        INT id PK
        VARCHAR name
        VARCHAR specialization
        VARCHAR license_number UK
        VARCHAR contact
        VARCHAR email
        TIMESTAMP created_at
    }

    PATIENTS {
        INT id PK
        VARCHAR name
        INT age
        VARCHAR gender
        VARCHAR contact
        VARCHAR address
        TEXT medical_history
        TIMESTAMP created_at
    }

    INVENTORY {
        INT id PK
        VARCHAR name
        VARCHAR category
        VARCHAR batch_number
        INT stock_quantity
        DECIMAL unit_price
        DATE expiry_date
        TIMESTAMP created_at
    }

    PRESCRIPTIONS {
        INT id PK
        INT patient_id FK
        INT doctor_id FK
        TEXT diagnosis
        VARCHAR status
        DATETIME date
        TIMESTAMP created_at
    }

    PRESCRIPTION_ITEMS {
        INT id PK
        INT prescription_id FK
        INT medicine_id FK
        VARCHAR dosage
        VARCHAR frequency
        VARCHAR duration
        INT quantity
    }
```

### Understanding the Diagram

* **DOCTORS → PRESCRIPTIONS:** One doctor can be associated with multiple prescriptions.
* **PATIENTS → PRESCRIPTIONS:** One patient can have multiple prescriptions.
* **PRESCRIPTIONS → PRESCRIPTION_ITEMS:** One prescription can contain multiple medicine entries.
* **INVENTORY → PRESCRIPTION_ITEMS:** One inventory record can be referenced by multiple prescription items.

The `||` symbol represents one, while `o{` represents zero or many.

### Many-to-Many Relationship

Conceptually, prescriptions and medicines have a many-to-many relationship:

* A prescription can contain several medicines.
* A medicine can be included in several prescriptions.

The `prescription_items` table resolves this relationship using two foreign keys: `prescription_id` and `medicine_id`.

It also stores attributes that belong to the relationship, including dosage, frequency, duration, and quantity.

---

## 📐 Relational Schema

The relational schema defines each table and identifies its primary and foreign keys.

**Notation:**

* `PK` — Primary Key
* `FK` — Foreign Key
* `UK` — Unique Key

### 1. DOCTORS

```text
DOCTORS(
    id PK,
    name,
    specialization,
    license_number UK,
    contact,
    email,
    created_at
)
```

### 2. PATIENTS

```text
PATIENTS(
    id PK,
    name,
    age,
    gender,
    contact,
    address,
    medical_history,
    created_at
)
```

### 3. INVENTORY

```text
INVENTORY(
    id PK,
    name,
    category,
    batch_number,
    stock_quantity,
    unit_price,
    expiry_date,
    created_at
)
```

### 4. PRESCRIPTIONS

```text
PRESCRIPTIONS(
    id PK,
    patient_id FK -> PATIENTS(id),
    doctor_id FK -> DOCTORS(id),
    diagnosis,
    status,
    date,
    created_at
)
```

### 5. PRESCRIPTION_ITEMS

```text
PRESCRIPTION_ITEMS(
    id PK,
    prescription_id FK -> PRESCRIPTIONS(id),
    medicine_id FK -> INVENTORY(id),
    dosage,
    frequency,
    duration,
    quantity
)
```

---

## 🔗 Database Relationships

| Relationship                       | Cardinality | Description                                                           |
| ---------------------------------- | ----------- | --------------------------------------------------------------------- |
| Doctors → Prescriptions            | One-to-Many | A doctor may issue multiple prescriptions.                            |
| Patients → Prescriptions           | One-to-Many | A patient may have multiple prescriptions.                            |
| Prescriptions → Prescription Items | One-to-Many | A prescription may contain multiple medicine entries.                 |
| Inventory → Prescription Items     | One-to-Many | An inventory record may be referenced by multiple prescription items. |

### Foreign Key Mapping

| Foreign Key                          | References         | Delete Rule |
| ------------------------------------ | ------------------ | ----------- |
| `prescriptions.patient_id`           | `patients.id`      | CASCADE     |
| `prescriptions.doctor_id`            | `doctors.id`       | CASCADE     |
| `prescription_items.prescription_id` | `prescriptions.id` | CASCADE     |
| `prescription_items.medicine_id`     | `inventory.id`     | RESTRICT    |

### Referential Integrity

Foreign keys prevent records from referencing nonexistent parent records.

For example, a prescription cannot reference a patient ID that does not exist in the `patients` table.

The supplied schema uses cascading deletion for prescriptions and their associated items, while restricting the deletion of inventory records that are still referenced by prescription items.

Because this application manages medical information, deletion rules should be reviewed carefully before production use.

---

## 🔐 Database Constraints

The database uses several SQL constraints to improve data consistency.

| Constraint       | Application                                              |
| ---------------- | -------------------------------------------------------- |
| `PRIMARY KEY`    | Uniquely identifies each record.                         |
| `FOREIGN KEY`    | Establishes relationships between tables.                |
| `NOT NULL`       | Requires essential fields to contain values.             |
| `UNIQUE`         | Prevents duplicate doctor license numbers.               |
| `DEFAULT`        | Supplies predefined values when an attribute is omitted. |
| `AUTO_INCREMENT` | Automatically generates sequential IDs.                  |

### Examples of Default Values

| Attribute                     | Default Value |
| ----------------------------- | ------------- |
| `patients.age`                | `0`           |
| `patients.gender`             | `'Unknown'`   |
| `inventory.stock_quantity`    | `0`           |
| `inventory.unit_price`        | `0.00`        |
| `prescriptions.status`        | `'Pending'`   |
| `prescription_items.quantity` | `1`           |

These defaults simplify record creation when optional information is not supplied. Additional validation can be introduced to prevent invalid values, such as negative stock or quantities.

---

## 🚀 Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Install or configure the following, as applicable to the repository:

* Git
* A code editor, such as Visual Studio Code
* The runtime required by the actual backend
* A compatible MySQL database server
* The package manager used by the project, if applicable

### Step 1: Clone the Repository

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your repository's actual clone URL.

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

### Step 2: Navigate to the Project

```bash
cd PharmRx
```

If the repository uses a different directory name, navigate to that directory instead.

### Step 3: Inspect the Project Files

Check the repository structure to identify the frontend, backend, dependency manifests, and configuration files.

For example:

```bash
git status
```

### Step 4: Install Dependencies

Use the installation command appropriate to the actual project.

For a Node.js project using npm:

```bash
npm install
```

Run this command from the directory containing the relevant `package.json`.

If the project separates the frontend and backend, install their dependencies separately.

### Step 5: Configure Environment Variables

Create a local `.env` file if the backend expects environment variables.

Example for a MySQL-backed application:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pharmrx
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

These are example variable names. Use the exact names expected by your application.

**Security:** Never commit real database passwords, API keys, access tokens, or production credentials to GitHub. Keep `.env` in `.gitignore` and provide an `.env.example` containing placeholders instead.

### Step 6: Start the Application

Use the scripts defined in the project's package manifest or other startup configuration.

For a Node.js application, a typical command might be:

```bash
npm run dev
```

Alternatively, the project may use a different command, such as `npm start`.

Consult the repository's configuration files for the correct startup procedure.

---

## 🗃️ Database Setup

The following SQL creates the five tables in the correct dependency order.

> **Important:** Execute this only when setting up a fresh database. Do not recreate tables in an existing database containing important data.

```sql
CREATE DATABASE pharmrx;
USE pharmrx;

CREATE TABLE doctors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) NOT NULL UNIQUE,
    contact VARCHAR(50) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) DEFAULT NULL,
    batch_number VARCHAR(100) DEFAULT NULL,
    stock_quantity INT DEFAULT 0,
    unit_price DECIMAL(10, 2) DEFAULT 0.00,
    expiry_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT DEFAULT 0,
    gender VARCHAR(50) DEFAULT 'Unknown',
    contact VARCHAR(50) DEFAULT '',
    address VARCHAR(255) DEFAULT NULL,
    medical_history TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    diagnosis TEXT DEFAULT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id)
        REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id)
        REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    medicine_id INT NOT NULL,
    dosage VARCHAR(100) DEFAULT NULL,
    frequency VARCHAR(100) DEFAULT NULL,
    duration VARCHAR(100) DEFAULT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (prescription_id)
        REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id)
        REFERENCES inventory(id) ON DELETE RESTRICT
);
```

### Verify the Database

After creating the tables, run:

```sql
USE pharmrx;
SHOW TABLES;
```

To inspect an individual table:

```sql
DESCRIBE doctors;
DESCRIBE patients;
DESCRIBE inventory;
DESCRIBE prescriptions;
DESCRIBE prescription_items;
```

These commands help verify that the tables and columns have been created.

---

## 🧪 Example SQL Queries

The following queries demonstrate how the database can be used.

### 1. Retrieve All Doctors

```sql
SELECT *
FROM doctors;
```

### 2. Retrieve All Patients

```sql
SELECT *
FROM patients;
```

### 3. Find Medicines With Low Stock

```sql
SELECT
    id,
    name,
    stock_quantity
FROM inventory
WHERE stock_quantity < 10;
```

This query identifies inventory records with fewer than ten units. The threshold is illustrative and can be changed to suit the pharmacy's requirements.

### 4. Retrieve Prescriptions With Patient and Doctor Details

```sql
SELECT
    p.id AS prescription_id,
    pt.name AS patient_name,
    d.name AS doctor_name,
    p.diagnosis,
    p.status,
    p.date
FROM prescriptions p
JOIN patients pt
    ON p.patient_id = pt.id
JOIN doctors d
    ON p.doctor_id = d.id;
```

This query demonstrates how foreign keys connect information across multiple tables.

### 5. Retrieve Medicines Included in Prescriptions

```sql
SELECT
    p.id AS prescription_id,
    pt.name AS patient_name,
    i.name AS medicine_name,
    pi.dosage,
    pi.frequency,
    pi.duration,
    pi.quantity
FROM prescription_items pi
JOIN prescriptions p
    ON pi.prescription_id = p.id
JOIN patients pt
    ON p.patient_id = pt.id
JOIN inventory i
    ON pi.medicine_id = i.id;
```

This query combines prescription, patient, inventory, and prescription-item data to produce a consolidated view.

### 6. Retrieve Medicines Near Their Expiry Date

```sql
SELECT
    id,
    name,
    batch_number,
    expiry_date
FROM inventory
WHERE expiry_date IS NOT NULL
  AND expiry_date BETWEEN CURRENT_DATE
                      AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY);
```

This query identifies inventory records expiring within the next 30 days. It is an example reporting query and does not itself generate alerts.

---

## 📸 Application Screenshots

Screenshots help demonstrate the actual user interface and implemented functionality.

Add screenshots to your repository in a folder such as `docs/screenshots/`, then reference them in this section.

### 1. Dashboard

<!-- Replace the path with your actual screenshot filename. -->

![PharmRx Dashboard](docs/screenshots/dashboard.png)

*The main application dashboard.*

### 2. Patient Management

![Patient Management](docs/screenshots/patients.png)

*Patient record management interface.*

### 3. Doctor Management

![Doctor Management](docs/screenshots/doctors.png)

*Doctor information management interface.*

### 4. Medicine Inventory

![Medicine Inventory](docs/screenshots/inventory.png)

*Medicine inventory interface.*

### 5. Prescription Management

![Prescription Management](docs/screenshots/prescriptions.png)

*Prescription management interface.*

> **Screenshot setup:** Create the `docs/screenshots/` folder and place your actual images there using the filenames above. If a screen is not implemented, omit its screenshot until it is available.

---

## 🔮 Future Enhancements

The following improvements could extend PharmRx beyond its current database foundation.

* [ ] **Automated Stock Management:** Deduct inventory quantities through validated dispensing transactions.
* [ ] **Low-Stock Notifications:** Notify authorized users when stock falls below a configured threshold.
* [ ] **Expiry Alerts:** Highlight medicines approaching their expiry dates.
* [ ] **Batch-Level Inventory:** Track stock separately for each medicine batch.
* [ ] **Advanced Search:** Search patients, doctors, prescriptions, and medicines using relevant attributes.
* [ ] **Prescription Reports:** Generate printable prescriptions and summaries.
* [ ] **Role-Based Access Control:** Separate permissions for administrators, doctors, and pharmacy personnel.
* [ ] **Audit Logs:** Record important actions and changes to sensitive data.
* [ ] **Data Validation:** Add checks for invalid ages, quantities, prices, and stock values.
* [ ] **Backup and Recovery:** Introduce a reliable database backup strategy.
* [ ] **Improved Record Retention:** Apply appropriate retention and archival policies for medical records.
* [ ] **Reporting Dashboard:** Display stock summaries, prescription statistics, and other useful operational metrics.

These items represent potential future work and should not be interpreted as features already implemented.

---

## ⚠️ Limitations

The supplied schema establishes the core data relationships but does not, by itself, implement every pharmacy workflow.

In particular:

* Stock deduction is not automatically performed by the supplied table definitions.
* The schema does not enforce a controlled set of prescription statuses.
* Negative quantities, prices, ages, or stock values are not explicitly prohibited by the supplied constraints.
* Inventory batch numbers are optional and are not independently modeled as a separate entity.
* Medical-record access control, audit logging, and retention policies require additional implementation.
* The actual application technology stack and UI capabilities must be confirmed from the source code.

PharmRx should be treated as a project implementation rather than a substitute for a clinically validated medical system. Real-world deployment requires appropriate security, privacy, data-integrity, and operational safeguards.

---

## 🤝 Contributing

Contributions and suggestions are welcome.

To propose a change:

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request describing the improvement.

Example:

```bash
git checkout -b feature/your-feature
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature
```

Follow the project's existing coding conventions and avoid committing secrets or sensitive patient information.

---

## 📄 License

No license has been specified in the supplied project details.

Before making the repository publicly reusable, add an appropriate license file, such as `LICENSE`, and update this section accordingly.

---

## 👨‍💻 Author

**Project:** PharmRx — Pharmacy & Prescription Management System

**Live Demo:** https://pharmrx-production.up.railway.app/

**GitHub Repository:** https://github.com/hridyanshk/pharmrx/branches

---

<p align="center">
  <strong>💊 PharmRx — Bringing Pharmacy Records Together</strong>
  <br>
  A structured approach to managing doctors, patients, medicines, and prescriptions.
</p>
