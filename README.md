# BloodLink - Web-Based Blood Donation Management System

![BloodLink Banner](frontend/public/logo.png)

**BloodLink** is a full-stack, enterprise-grade blood donation management and emergency dispatch platform engineered according to the Unified Modeling Language (UML) specifications, Software Requirements Specification (SRS), Entity-Relationship (ER) models, and Activity Diagrams. 

BloodLink connects verified healthcare institutions with voluntary, clinically eligible blood donors in real time—enforcing safety intervals, donor contact privacy, and transparent blood inventory accounting.

---

## 📋 Document Inspection & Reconciliation

During analysis of the source artifacts (Use Case Specifications, Hospital Activity Diagram, Donor Activity Diagram, and ER Diagram), key requirements and architectural discrepancies were identified and reconciled:

| Topic | Discrepancy / Document Source | Reconciled Decision in BloodLink |
| :--- | :--- | :--- |
| **Blood Request Initiator** | Use Case 6 listed the Donor as requester, whereas the SRS and Hospital Activity Diagram indicated the Hospital. | **Hospital is the Primary Requester.** Hospitals identify patient emergencies, submit required units/urgency/blood group, and coordinate with eligible donors. |
| **Eligibility & Tattoo Rule** | Donor Activity Diagram explicitly states: *"is there any tattoo in last 3 months?"*. | Implemented as a **configurable project safety rule** (`TATTOO_MONTHS_RESTRICTION: 3`). Any tattoo or piercing within 3 months triggers a temporary deferral and displays clear clinical reasoning. |
| **Donation Interval Rule** | Supported in Use Case 5 & Activity Diagram (*"check the last donation period"*). | Configured to a **90-day minimum interval** between whole blood donations. Donors see remaining recovery days and their exact next eligible date. |
| **Database Engine** | Original SRS suggested MySQL; project directive specified MongoDB. | Developed with **MongoDB and Mongoose**, featuring a normalized data model with explicit schema constraints, referential integrity, and automated zero-dependency in-memory fallback. |
| **Donor Privacy Safeguards** | SRS and HIPAA best practices recommend protecting donor contact information. | Direct donor phone and email are **masked until the donor accepts** a specific hospital match. |

---

## 🎨 Design System & Color Palette

BloodLink implements a cohesive, accessible color system across all screens and components:

### 1. Global Application Palette
| Use | Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary** | Deep Red | `#B42332` | Core brand color, primary action buttons, active states |
| **Primary Hover** | Dark Red | `#8F1D2A` | Hover and active interaction states |
| **Secondary** | Teal | `#167D8D` | Secondary actions, badges, accents |
| **Page Background** | Soft Warm White | `#F7F8FA` | Global background canvas across views |
| **Cards & Surfaces** | Pure White | `#FFFFFF` | Panels, card surfaces, modal dialogs |
| **Main Text** | Charcoal | `#202B36` | Headings, primary typography, high-contrast labels |
| **Secondary Text** | Slate Gray | `#667085` | Subtitles, supporting copy, metadata |
| **Borders** | Pale Gray | `#E4E7EC` | Card borders, dividers, table row outlines |
| **Success** | Green | `#25855A` | Eligible badges, fulfilled statuses, positive alerts |
| **Warning** | Amber | `#B7791F` | Pending states, deferral notices, low stock warnings |
| **Error** | Red | `#D04444` | Ineligibility alerts, critical urgency, cancellation |

### 2. Blood Compatibility Explorer Palette
| Element | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Page Background** | `#F5F7FA` | Explorer section canvas |
| **Main Panel** | `#FFFFFF` | Explorer container surface |
| **Result Cards** | `#FFFFFF` | Donor and Patient compatibility cards |
| **Borders** | `#E2E8F0` | Card borders & unselected chips |
| **Main Text** | `#1F2937` | Heading & chip text |
| **Supporting Text** | `#64748B` | Explorer description |
| **Selected Blood Group** | `#C6283D` | Active chip fill & category badge |
| **Donor Compatibility** | `#15805D` | Can Donate To header & target pills |
| **Patient Compatibility** | `#087E9B` | Can Receive From header & source pills |

---

## 🚀 Core Workflows by Role

### 1. Hospital Workflow
1. **Submit Blood Request:** Hospital staff input patient name, age, blood group needed, unit count, urgency (`critical`, `high`, `medium`, `low`), needed-by date, hospital location, and clinical notes.
2. **Automated Matching Engine:** Evaluates registered donors against ABO/Rh compatibility, location, availability, and clinical safety eligibility in real time.
3. **Donor Dispatch & Notification:** Matching eligible donors receive automated in-app alerts.
4. **Review & Fulfillment:** Hospital monitors donor responses (`pending`, `accepted`, `rejected`, `completed`). Contact numbers and emails are unveiled only after a donor accepts.
5. **Confirm Donation:** Hospital records the completed donation on site, generating a permanent verification code (`DON-XXXXXX`).
6. **Stock & History Updates:** Updating the request status (`open` $\to$ `partially_fulfilled` $\to$ `fulfilled`), logging the donor's `lastDonationDate`, and incrementing hospital blood bank inventory units.

### 2. Donor Workflow
1. **Registration & Clinical Profiling:** Donors sign up with blood group, date of birth, weight, location, contact info, last donation date, and recent tattoo records.
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

## 🔐 Account Creation & First-Time Setup

BloodLink is completely clean of hardcoded demo accounts, mock records, and seed data. Follow the instructions below to create real accounts for each role:

### 1. Provisioning the Initial Administrator
Because administrator privileges grant full platform governance, public registration is restricted exclusively to Donors and Hospitals. The first Administrator can be provisioned securely via any of these three methods (no hardcoded credentials):

- **Method A: Web Setup Wizard (Recommended)**
  1. Open the application in your browser (`http://localhost:3000`).
  2. If no admin account exists in the database, the Login page displays an initialization banner, or navigate directly to `http://localhost:3000/setup-admin`.
  3. Enter your administrative name, official email, and a secure password (minimum 8 characters).
  4. Submit the form. Once created, the setup endpoint automatically **permanently locks** itself to prevent any subsequent administrative creations.

- **Method B: CLI Interactive Setup**
  In your terminal:
  ```bash
  cd backend
  npm run setup:admin
  ```
  Follow the interactive prompts to specify the administrator name, email, and password.

- **Method C: Environment Variables**
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
   - Facility Type (*Government, Private, Specialty Clinic, Blood Bank, Charitable*)
   - Official Email and Password
   - Primary Phone, 24/7 Emergency Hotline, and Physical Address
4. Submit the registration. You will be redirected directly to your **Hospital Operations Dashboard** (`/hospital/dashboard`).

---

### 3. Creating Real Voluntary Donor Accounts
1. Navigate to `http://localhost:3000/register`.
2. Select the **Voluntary Donor** tab.
3. Fill in your donor profile:
   - Full Legal Name, Email, and Password
   - Blood Group (*A+, A-, B+, B-, AB+, AB-, O+, O-*)
   - Date of Birth, Gender, and Body Weight (kg)
   - City / Municipality, Phone Number, and Physical Address
   - Last donation date (*leave blank if first-time donor*)
   - Tattoo / body piercing declaration (*checked if within the last 3 months*)
4. Submit the registration. You will be redirected directly to your **Donor Portal** (`/donor/dashboard`), where your clinical eligibility analysis is immediately generated.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router 6, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose (with automated `mongodb-memory-server` fallback for zero-dependency standalone evaluation)
- **Security & Auth:** JSON Web Tokens (JWT), Bcrypt password hashing (10 salt rounds), Role-Based Access Control (RBAC) middleware

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
Managed via `.env` in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/bloodlink?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Optional: Automatic Initial Administrator Setup
# If configured and 0 admins exist in the DB, this admin will be initialized on startup.
# Alternatively, use the Web Wizard at /setup-admin or run: npm run setup:admin
# ADMIN_EMAIL=admin@yourorganization.org
# ADMIN_PASSWORD=YourSecurePassword123!
# ADMIN_NAME=Platform Administrator
```

> **Zero-Configuration Local MongoDB:** If an external MongoDB server is not running on `MONGODB_URI`, the server will **automatically initialize a self-contained in-memory MongoDB database** so you can run and evaluate the system immediately without installing external software!

### Frontend (`frontend/.env.local`)
Managed via `.env.local` in the `frontend/` directory:

```env
# Backend API base URL
# Leave unset or empty for local development (defaults to /api which proxies to http://localhost:5000)
# Set to your deployed Vercel backend URL for production builds
VITE_API_URL=http://localhost:5000
```

---

## ☁️ Deployment Guide (Vercel)

BloodLink is configured for deployment as **two separate Vercel projects from the same GitHub repository**:
- `frontend/` — Vite Frontend Single Page Application
- `backend/` — Express Serverless API

> **Important:** Do not use Vercel multi-service configuration. Instead, import the same GitHub repository into Vercel twice, creating one independent project per root directory.

### 1. Deploy the Backend Project

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." $\to$ "Project"**.
2. Select and import your BloodLink GitHub repository.
3. In the project configuration:
   - **Project Name:** `bloodlink-backend` (or your preferred name)
   - **Root Directory:** Click *Edit* and select **`backend`**
   - **Framework Preset:** Express (or Other)
   - **Build & Output Settings:** Leave default
4. In **Environment Variables**, add the following:
   | Variable | Value / Description |
   | :--- | :--- |
   | `MONGODB_URI` | Your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/bloodlink?retryWrites=true&w=majority`). Mongoose reuses and caches connections across serverless invocations under the `bloodlink` database. |
   | `JWT_SECRET` | A secure, random secret key (minimum 32 characters) for signing and verifying authentication tokens. |
   | `FRONTEND_URL` | Your frontend production URL (e.g., `https://bloodlink-frontend.vercel.app`) or temporary placeholder until the frontend is deployed. Configures CORS to permit requests from this origin while preserving localhost access for development. |
5. Click **Deploy**. Once deployed, copy your backend URL (e.g., `https://bloodlink-backend.vercel.app`).

### 2. Deploy the Frontend Project

1. Return to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." $\to$ "Project"**.
2. Import the **same GitHub repository** a second time.
3. In the project configuration:
   - **Project Name:** `bloodlink-frontend` (or your preferred name)
   - **Root Directory:** Click *Edit* and select **`frontend`**
   - **Framework Preset:** **Vite**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   | Variable | Value / Description |
   | :--- | :--- |
   | `VITE_API_URL` | Set to your deployed backend URL from Step 1 (e.g., `https://bloodlink-backend.vercel.app`). All API calls will automatically route to this endpoint. |
5. Click **Deploy**. Once complete, your BloodLink web application is live!
6. *(Final CORS check)*: If the frontend URL generated by Vercel differs from what you entered in the backend's `FRONTEND_URL`, update `FRONTEND_URL` in the backend project's Environment Variables and trigger a quick redeploy.

---

## 🚀 How to Run the Application Locally

### 1. Prerequisites
- Node.js (v18+ recommended)
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

### 4. Production Build
```bash
cd frontend
npm run build
```
Build output will be bundled into `frontend/dist/`.

---

## 🗄️ Normalized Data Model Architecture

The schema maps the UML / ER design into normalized MongoDB collections:

- **`User`**: Base authentication identity (`name`, `email`, `password`, `role`, `isActive`, timestamps).
- **`DonorProfile`**: 1-to-1 extension of User (`bloodGroup`, `dob`, `phone`, `gender`, `address`, `city`, `lastDonationDate`, `hasTattooLast3Months`, `tattooDate`, `weightKg`, `isAvailable`, `totalDonations`).
- **`HospitalProfile`**: 1-to-1 extension of User (`hospitalName`, `registrationNumber`, `hospitalType`, `phone`, `address`, `city`, `emergencyContact`).
- **`BloodRequest`**: Blood demand entity (`hospitalId`, `patientName`, `patientAge`, `bloodGroup`, `unitsRequired`, `unitsFulfilled`, `urgency`, `neededByDate`, `location`, `status`, `notes`).
- **`RequestMatch`**: Association linking BloodRequest and candidate DonorProfile with response lifecycle (`pending`, `accepted`, `rejected`, `completed`).
- **`Donation`**: Verified donation ledger (`donationCode`, `requestId`, `donorId`, `hospitalId`, `units`, `bloodGroup`, `donationDate`, `status`, `verifiedByHospital`).
- **`EligibilityCheck`**: Audit records of clinical rule evaluations with granular condition breakdowns.
- **`Notification`**: Real-time user alerts and match notifications.
- **`BloodInventory`**: Hospital blood bank stock tracking across all 8 blood groups.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new donor or hospital user
- `POST /api/auth/login` - Authenticate and obtain JWT token
- `GET /api/auth/me` - Retrieve current user profile and role data (Private)
- `GET /api/auth/setup-status` - Check if any platform administrator exists
- `POST /api/auth/setup-admin` - One-time setup endpoint to provision initial admin

### Donor Operations (`/api/donor`)
- `GET /api/donor/profile` - Retrieve full donor profile with medical history
- `PUT /api/donor/profile` - Update donor attributes and availability
- `GET /api/donor/eligibility` - Run real-time clinical eligibility evaluation
- `GET /api/donor/requests` - Retrieve matching blood requests for the donor
- `POST /api/donor/requests/:matchId/respond` - Accept or reject a blood request
- `GET /api/donor/history` - Retrieve verified personal donation records

### Hospital Operations (`/api/hospital`)
- `GET /api/hospital/profile` - Retrieve hospital facility details
- `PUT /api/hospital/profile` - Update hospital contact and emergency hotline
- `POST /api/hospital/requests` - Submit a new patient blood request with auto-matching
- `GET /api/hospital/requests` - Retrieve hospital blood requests
- `GET /api/hospital/requests/:id` - View request details and donor response ledger
- `POST /api/hospital/requests/:id/cancel` - Cancel a blood request
- `GET /api/hospital/donors/search` - Privacy-preserving donor search
- `POST /api/hospital/donations/confirm` - Record a completed donation and update inventory

### Blood Bank Inventory (`/api/inventory`)
- `GET /api/inventory` - Get stock levels across all 8 blood groups
- `PUT /api/inventory` - Update stored unit counts for a blood group

### System Administration (`/api/admin`)
- `GET /api/admin/stats` - Platform KPIs, donor distributions, and inventory totals
- `GET /api/admin/users` - Oversee all registered users with role filter
- `PUT /api/admin/users/:id/toggle-status` - Activate or deactivate user accounts
- `GET /api/admin/requests` - Oversight of all hospital requests
- `GET /api/admin/reports` - Statistical summaries and monthly donation volumes

---

## 📁 Project Directory Structure

```
BloodLink/
├── .gitignore                      # Root git ignore rules
├── IMPLEMENTATION_SUMMARY.md       # Implementation and discrepancy reconciliation notes
├── README.md                       # Complete platform documentation
├── package.json                    # Root setup script
├── backend/
│   ├── .env.example                # Backend environment template
│   ├── .gitignore                  # Backend git ignore rules
│   ├── package.json                # Backend dependencies and scripts
│   ├── server.js                   # Express application entrypoint
│   ├── config/
│   │   ├── db.js                   # Mongoose connection & in-memory fallback
│   │   └── eligibilityConfig.js    # Configurable clinical safety rules
│   ├── controllers/
│   │   ├── adminController.js      # System admin analytics and user governance
│   │   ├── authController.js       # Auth, JWT, and one-time admin setup
│   │   ├── donorController.js      # Donor profile, matches, and response handlers
│   │   ├── hospitalController.js   # Request dispatch, search, and donation confirmation
│   │   └── inventoryController.js  # Hospital blood stock management
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification and RBAC authorization
│   │   └── errorHandler.js         # Centralized error handling
│   ├── models/
│   │   ├── User.js                 # User identity model
│   │   ├── DonorProfile.js         # Donor profile extension
│   │   ├── HospitalProfile.js      # Hospital profile extension
│   │   ├── BloodRequest.js         # Demand model
│   │   ├── RequestMatch.js         # Match association & response lifecycle
│   │   ├── Donation.js             # Verified ledger
│   │   ├── EligibilityCheck.js     # Clinical screening audit
│   │   ├── Notification.js         # User alerts
│   │   └── BloodInventory.js       # Hospital stock levels
│   ├── routes/                     # Express route definitions
│   ├── scripts/
│   │   └── createAdmin.js          # Standalone CLI admin provisioning utility
│   └── services/
│       ├── eligibilityService.js   # Automated clinical safety rule engine
│       └── matchingService.js      # Automated donor-to-request compatibility matcher
└── frontend/
    ├── .gitignore                  # Frontend git ignore rules
    ├── index.html                  # HTML entrypoint with favicon links
    ├── package.json                # Frontend dependencies and build scripts
    ├── vite.config.js              # Vite bundler configuration
    ├── tailwind.config.js          # Design system & color palette tokens
    ├── public/
    │   ├── favicon.png             # Official brand favicon
    │   ├── icon.png                # Tight transparent drop emblem
    │   ├── icon-32.png .. 512.png  # Multi-resolution icon variants
    │   └── logo.png                # Transparent high-res full logo
    └── src/
        ├── App.jsx                 # App root and route mounting
        ├── index.css               # Base styles & custom scrollbars
        ├── main.jsx                # React root mount
        ├── components/
        │   ├── EligibilityCard.jsx # Live medical criteria breakdown
        │   ├── Footer.jsx          # Site footer
        │   ├── Navbar.jsx          # Role-aware responsive navigation
        │   ├── ProtectedRoute.jsx  # RBAC route guard
        │   └── StatusBadge.jsx     # Semantic status badges
        ├── context/
        │   ├── AuthContext.jsx     # Authentication & user state
        │   └── ToastContext.jsx    # Notification toast alerts
        ├── pages/
        │   ├── Home.jsx            # Landing page & Blood Compatibility Explorer
        │   ├── About.jsx           # System specifications & clinical rules
        │   ├── Login.jsx           # Clean sign-in
        │   ├── Register.jsx        # Role-based registration
        │   ├── SetupAdmin.jsx      # Web wizard for initial administrator setup
        │   ├── admin/              # Admin dashboard, user management, reports
        │   ├── donor/              # Donor dashboard, eligibility, history, matches
        │   └── hospital/           # Hospital dashboard, request tracking, inventory, donor search
        └── services/
            └── api.js              # Client HTTP API layer
```

---

## 🔒 Security & Privacy Guarantees

- **No Plaintext Passwords:** Passwords hashed with `bcryptjs` using 10 salt rounds.
- **Donor Contact Privacy:** Donor phone numbers and email addresses remain masked during donor discovery and initial matching; they are unveiled exclusively when a donor explicitly accepts a hospital's request.
- **Strict Role-Based Authorization:** Endpoints verify role privileges (`donor`, `hospital`, `admin`) before executing operations.
- **Secure Administrator Setup:** No hardcoded admin credentials; the `/setup-admin` endpoint is permanently locked once an administrator exists.
- **Input Sanitization & Constraints:** Mongoose validation rules and enum checks protect data integrity on every write.

---

## 📄 License

This project is licensed under the MIT License.