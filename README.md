## Smart Maintenance & Incident Prediction System 🛠️🤖
Hackathon Problem Statement 1: Smart Maintenance, Incident Tracking & Prediction SystemA comprehensive, full-stack platform designed to streamline campus facility management. It features real-time incident reporting, intelligent technician assignment, interactive heatmaps, and a deterministic AI engine that predicts infrastructure failures before they happen.

### 🚀 Key Features🧠 AI & Predictive MaintenanceDeterioration Detection: 

Uses Spearman Rank Correlation & Linear Regression to detect accelerating failure rates (e.g., an elevator breaking down more frequently).Wear-Out Analysis: 
Implements Weibull Survival Analysis to estimate the probability of equipment failure based on age.Seasonal Forecasting: Uses Chi-Square tests to identify recurring issues (e.g., AC filters clogging every 2 weeks or water leaks on Mondays).Spatial Clustering: Uses Poisson Distribution to detect infrastructure anomalies (e.g., 5 electrical failures in one block = System Failure).

👥 Role-Based Access Control (RBAC)Student/Staff Portal: Simple, multi-step "Wizard" for reporting issues with GPS location locking and photo uploads. Live status tracking timeline.Technician Dashboard: Dedicated job queue with "Accept", "Start", and "Resolve" workflows. Auto-refreshes and alerts on SLA breaches.Admin Command Center: Live heatmap of high-density zones, AI diagnostics trigger, and full user management.
⚙️ Intelligent AutomationSmart Priority Matrix: Auto-calculates priority (Low/Medium/High) based on keywords (e.g., "fire", "spark") and location context (e.g., "Server Room").Auto-Assignment: Algorithms assign the best-suited technician based on Specialty (Plumbing/Electrical) and Current Workload.Duplicate Shield: Prevents spam by checking for similar active reports within a 20m GPS radius.

🛠️ Tech StackFramework: Next.js 15 (App Router)Language: TypeScriptDatabase: MongoDB (via Mongoose)Styling: Tailwind CSSAuthentication: NextAuth.js (Credentials Provider)Maps: Leaflet (React-Leaflet)Icons: Lucide React

⚡ Getting Started1. PrerequisitesNode.js 18+ installed.A MongoDB Atlas connection string.2. Clone & Installgit clone [https://github.com/your-username/smart-maintenance.git](https://github.com/your-username/smart-maintenance.git)
cd smart-maintenance
npm install

3. Environment SetupCreate a .env.local file in the root directory:# MongoDB Connection String
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/smart_maintenance

# NextAuth Secret (Any random string)
NEXTAUTH_SECRET=your_super_secret_key_here
NEXTAUTH_URL=http://localhost:3000


4. Run the Development Servernpm run dev
Open http://localhost:3000 in your browser.🧪 Seeding Data & Testing AITo demonstrate the AI capabilities, you don't need to wait for weeks of data. We have included a Smart Seed Script that plants specific mathematical patterns in the database.Seed the Database:Visit: http://localhost:3000/api/seedResult: Creates Users and injects 25+ incidents simulating deterioration, seasonality, and clusters.Login Credentials:Admin: admin@college.edu / password123Technician: ramesh@college.edu / password123Student: rahul@college.edu / password123Run AI Diagnostics:Login as Admin.Go to the Dashboard.Click the "Run Diagnostics" button.Observe: The system will generate cards like "CRITICAL: System Deterioration" and "Seasonal Pattern: Mondays".

📂 Project Structuresrc/
├── app/
│   ├── api/              # Backend Routes (Incidents, Auth, Predictions)
│   ├── admin/            # Admin Dashboard Pages
│   ├── student/          # Student Dashboard Pages
│   ├── technician/       # Technician Dashboard Pages
│   ├── report/           # Public Reporting Wizard
│   └── login/            # Auth Pages
├── components/           # Reusable UI (Heatmap, Bell, Sidebar)
├── lib/                  # DB Connection & Helpers
├── models/               # Mongoose Schemas (User, Incident, Prediction)
└── middleware.ts         # RBAC Security Logic

🏆 Hackathon Highlights: 
Python-Free AI: The prediction engine uses pure TypeScript implementations of statistical models, ensuring zero-latency analysis without external ML servers.Security: Middleware ensures strict separation of concerns. Technicians cannot access Admin routes, and Students cannot see internal tickets.UX: "Dark Mode" support and a mobile-first design for field technicians.

📄 License
This project is open-source and available under the MIT License.