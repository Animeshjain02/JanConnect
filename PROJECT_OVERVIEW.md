# CivicAI – JanConnect Project Overview

JanConnect is a next-generation civic engagement platform designed to bridge the gap between citizens and government departments. It uses AI to automate grievance classification and provides real-time transparency through analytics and interactive mapping.

## 1. Technical Stack

### Frontend (User Interface)
- **Framework**: [React 19](https://react.dev/) (Powered by [Vite](https://vitejs.dev/))
- **Language**: TypeScript (Type-safe development)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) for high-performance, modern aesthetics.
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Geospatial Mapping**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/) (OpenStreetMap API)
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) & [React-chartjs-2](https://react-chartjs-2.js.org/) for departmental performance monitoring.
- **Communication**: Axios for RESTful API interaction.

### Backend (Server Layer)
- **Environment**: Node.js
- **Developing Language**: TypeScript
- **Framework**: Express.js
- **Database**: [MongoDB](https://www.mongodb.com/) using [Mongoose ODM](https://mongoosejs.com/) for document modeling.
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt for secure password hashing.
- **Artificial Intelligence**: [Google Gemini API](https://ai.google.dev/) used for automated complaint analysis, sentiment detection, and department routing.

---

## 2. Project Workflow (The Flow)

### Step 1: Authentication & RBAC
- Users register with their credentials and choose a **Role** (Citizen or Officer).
- **RBAC (Role-Based Access Control)** ensures citizens can only report and view their own data, while officers can access departmental management tools.

### Step 2: Grievance Submission (Citizen)
1. **Multi-Media Input**: Citizens submit issues with text descriptions, images (captured via camera), and **Voice Notes** (recorded directly in the browser).
2. **Location Intelligence**: The browser's GeoLocation API automatically captures exact coordinates (Lat/Lng) for precise mapping.
3. **AI Triage**: Upon submission, the backend sends the data to the **Gemini AI Engine**.
   - AI auto-assigns a **Department** (e.g., Public Works, Health).
   - AI determines **Severity** (Low, Medium, High, Critical).
   - AI generates a **Priority Score** for officers.

### Step 3: Lifecycle & Tracking
JanConnect uses a strict lifecycle progress bar:
- **Submitted**: Logged in the system.
- **Under Review**: AI analysis complete, department acknowledged.
- **Assigned**: An officer has been designated to handle the task.
- **In Progress**: Work is actively being carried out.
- **Resolved**: Success! The officer marks it done.

### Step 4: Community Engagement (Upvoting)
- Citizens can visit the **"Issues Near You"** page.
- Using coordinates, the system fetches all local issues within a 5km radius.
- Citizens can **Upvote** existing issues. 
- Higher upvotes signal community priority, pushing issues higher on the officer's dashboard.

### Step 5: Departmental Management (Officer)
- Officers see a **Priority-Sorted Task Board**.
- They can mark tasks as "Assigned", "In Progress", or "Resolved".
- They can see community sentiment (upvote counts) to decide which civic works to prioritize first.

### Step 6: Transparency & Mapping
- **Strategic Map**: A global view of all civic issues color-coded by status.
- **Analytics Dashboard**: Real-time metrics on Uptime, Average SLA (resolution time), and Departmental performance charts.

---

## 3. Key Advanced Features
- **Hyper-Local Radius Search**: Uses the Haversine formula to find issues based on distance.
- **React Portals Lightbox**: High-performance image viewing without clipping issues.
- **HMR (Hot Module Replacement)**: Fast developer experience with Vite.
- **Cloud-Ready Configuration**: Infrastructure as Code (IaC) via `render.yaml` for one-click deployment.
