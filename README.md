# BloodLink - Web-Based Blood Donation Management System

BloodLink is a full-stack, role-based blood donation coordination platform engineered according to the Unified Modeling Language (UML) specifications, Software Requirements Specification (SRS), Entity-Relationship (ER) models, and Activity Diagrams provided for the BloodLink project.

---

## 📋 Document Inspection & Reconciliation

During analysis of the source artifacts (Use Case Specifications, Hospital Activity Diagram, Donor Activity Diagram, and ER Diagram), key requirements and architectural decisions were identified and reconciled:

| Topic | Discrepancy / Document Source | Reconciled Decision in BloodLink |
| :--- | :--- | :--- |
| **Blood Request Requester** | Use Case 6 listed the Donor as requester, whereas the SRS and Hospital Activity Diagram indicated the Hospital. | **Hospital is the Primary Requester.** Hospitals identify patient emergencies, submit required units/urgency/blood group, and coordinate with eligible donors. |
| **Eligibility & Tattoo Rule** | Donor Activity Diagram explicitly states: *"is there any tattoo in last 3 months?"*. | Implemented as a **configurable project safety rule** (`TATTOO_MONTHS_RESTRICTION: 3`). Any tattoo or body piercing within 3 months triggers a temporary deferral and displays clear clinical reasoning. |
| **Donation Interval Rule** | Supported in Use Case 5 & Activity Diagram (*"check the last donation period"*). | Configured to a **90-day minimum interval** between whole blood donations. Donors see remaining days and their exact next eligible date. |
| **Database Engine** | Original SRS suggested MySQL; user directive specified MongoDB. | Developed with **MongoDB and Mongoose**, featuring a normalized data model with explicit schema constraints, referential integrity, and automated in-memory fallback. |
| **Privacy Safeguards** | SRS and HIPAA best practices recommend protecting donor contact information. | Direct donor phone and email are **masked until the donor accepts** a specific hospital match. |

---

## 🚀 Core Features & Workflows

### 1. Hospital Workflow
1. **Submit Blood Request:** Hospital submits patient details (`patientName`, `patientAge`), requested blood group, units needed, clinical urgency (`critical`, `high`, `medium`, `low`), needed-by date, location, and contact hotline.
2. **Automated Donor Matching:** The system queries compatible blood groups (e.g., $O^-$ for universal needs, $A^+$ receiving $A^+$, $A^-$, $O^+$, $O^-$), checks geographical proximity, verifies donor availability, and enforces clinical eligibility rules.
3. **Automated Notification Dispatch:** Matching eligible donors receive urgent notifications in real-time.
4. **Review & Fulfillment:** Hospital reviews donor responses (`pending`, `accepted`, `declined`), accesses unmasked contact information for accepted donors, and records completed donations.
5. **Inventory Updating:** Completed donations update request progress (`open` $\to$ `partially_fulfilled` $\to$ `fulfilled`), log the donor's `lastDonationDate`, and increment hospital blood bank inventory units.

### 2. Donor Workflow
1. **Registration & Clinical Profiling:** Donors sign up with blood group, date of birth, weight, location, last donation date, and recent tattoo records.
2. **Real-time Eligibility Card:** Visual breakdown of medical criteria (interval, tattoo rule, age 18–65, weight $\ge 45$ kg, availability) with exact explanatory reasons for any deferral.
3. **Interactive Eligibility Simulator:** Allows donors to simulate hypothetical future dates and health metrics to determine when they can donate next.
4. **Matching Requests:** Filter matching hospital requests and accept or decline with one click. Ineligible donors are prevented from accepting until their recovery interval is satisfied.
5. **Verified Donation History:** Certified records of all donations confirmed by hospitals, including unique donation verification codes.

### 3. Administrator Workflow
1. **Platform Metrics & KPIs:** Overview of total donors, certified hospitals, active requests, fulfillment rates, and blood bank units.
2. **User Governance:** Oversight of all user accounts across donors, hospitals, and administrators with status toggling (Active / Deactivated).
3. **Request Oversight:** Global visibility into all hospital requests with administrative cancellation powers.
4. **Audit Reports:** Statistical breakdowns of request lifecycles and monthly donation volumes.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose (with automated `mongodb-memory-server` fallback for zero-dependency standalone evaluation)
- **Security & Auth:** JSON Web Tokens (JWT), Bcrypt password hashing, role-based authorization gates

---

---

## 🔐 Account Creation & First-Time Setup

BloodLink is completely clean of hardcoded demo accounts, mock records, and seed data. Follow the steps below to create real accounts for each role:

### 1. Provisioning the Initial Administrator
Because administrator privileges grant full platform governance, public registration is restricted exclusively to Donors and Hospitals. The first Administrator can be provisioned securely via any of these three methods (no hardcoded passwords):

- **Method A: Web Setup Wizard (Recommended)**
  1. Open the application in your browser (`http://localhost:3000`).
  2. If no admin account exists in the database, the Login page displays a prompt: *"No administrator account found. Initialize platform admin"*, or visit directly: `http://localhost:3000/setup-admin`.
  3. Enter your administrative name, official email, and a secure password (minimum 8 characters).
  4. Submit the form. Once created, the setup endpoint automatically **permanently locks** itself to prevent any further administrative creations.

- **Method B: CLI Interactive Setup**
  In your terminal:
  ```bash
  cd backend
  npm run setup:admin
  ```
  Follow the interactive prompts to specify the administrator name, email, and password.

- **Method C: Environment Configuration**
  In `backend/.env`, set:
  ```env
  ADMIN_EMAIL=admin@yourorganization.org
  ADMIN_PASSWORD=YourStrongPasswordHere123!
  ADMIN_NAME=System Administrator
  ```
  When the backend starts, if zero administrators exist, it will safely initialize this account.

---

### 2. Creating Real Hospital Accounts
1. Navigate to `http://localhost:3000/register`.
2. Click the **Hospital / Clinic** tab.
3. Fill in the clinical credentials:
   - Hospital / Clinic Legal Name
   - Official Medical Accreditation / License Number
   - Facility Type (Government, Private, Specialty Clinic, Blood Bank, Charitable)
   - Official Email and Password
   - Primary Phone, 24/7 Emergency Hotline, and Physical Address
4. Submit the registration. You will be redirected directly to your **Hospital Operations Dashboard** (`/hospital/dashboard`).

---

### 3. Creating Real Voluntary Donor Accounts
1. Navigate to `http://localhost:3000/register`.
2. Select the **Voluntary Donor** tab.
3. Fill in your donor profile:
   - Full Legal Name, Email, and Password
   - Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)
   - Date of Birth, Gender, and Body Weight (kg)
   - City / Municipality, Phone Number, and Physical Address
   - Last donation date (leave blank if first-time donor)
   - Tattoo / body piercing declaration (checked if within the last 3 months)
4. Submit the registration. You will be redirected directly to your **Donor Portal** (`/donor/dashboard`), where your clinical eligibility analysis is immediately generated.

---

## ⚙️ Environment Variables

The backend configuration is managed via `.env` in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/bloodlink
JWT_SECRET=your_jwt_secret_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **Note on MongoDB:** If an external MongoDB server is not running on `MONGODB_URI`, the server will **automatically initialize a self-contained in-memory MongoDB database** so you can run and evaluate the system immediately without installing or configuring external services!

---

## 🚀 How to Run the Application

### 1. Prerequisites
- Node.js (v18+ recommended, verified on v22.15.0)
- npm (v9+)

### 2. Backend Setup & Startup
```bash
cd backend
npm install
npm start
```
The backend API server will run at: **`http://localhost:5000`**

To provision an initial administrator via CLI at any time:
```bash
npm run setup:admin
```

### 3. Frontend Setup & Startup
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The web application will open at: **`http://localhost:3000`** (or the port displayed by Vite).

---

## 🗄️ Normalized Data Model Architecture

The schema reflects the project's ER diagram mapped to MongoDB collections:

- **`User`**: Base identity collection (`email`, `password`, `role`, `isActive`, timestamps).
- **`DonorProfile`**: 1-to-1 extension of User (`bloodGroup`, `dob`, `phone`, `gender`, `address`, `city`, `lastDonationDate`, `hasTattooLast3Months`, `tattooDate`, `weightKg`, `isAvailable`, `totalDonations`).
- **`HospitalProfile`**: 1-to-1 extension of User (`hospitalName`, `registrationNumber`, `hospitalType`, `phone`, `address`, `city`, `emergencyContact`).
- **`BloodRequest`**: Blood demand entity (`hospitalId`, `patientName`, `patientAge`, `bloodGroup`, `unitsRequired`, `unitsFulfilled`, `urgency`, `neededByDate`, `location`, `status`, `notes`).
- **`RequestMatch`**: Association entity linking BloodRequest and candidate DonorProfile with response lifecycle (`pending`, `accepted`, `rejected`, `completed`).
- **`Donation`**: Verified donation ledger (`donationCode`, `requestId`, `donorId`, `hospitalId`, `units`, `bloodGroup`, `donationDate`, `status`, `verifiedByHospital`).
- **`EligibilityCheck`**: Audit records of clinical rule evaluations with granular condition breakdowns.
- **`Notification`**: Real-time user alerts and match notifications.
- **`BloodInventory`**: Hospital blood bank stock tracking across all 8 blood groups.
#   B l o o d L i n k  
 