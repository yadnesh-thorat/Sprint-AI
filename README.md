# 🏙️ SprintX AI: The Future of Agile Management

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Render Deployment](https://img.shields.io/badge/Render-Deployed-brightgreen)](https://render.com)
[![Vite](https://img.shields.io/badge/Frontend-Vite%20%2B%20React-blue)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)

**SprintX AI** is an industry-level project management platform that transforms raw **Software Requirement Specifications (SRS)** into a fully functional **Sprints/Kanban Board** in under 10 seconds using advanced Generative AI. 🚀⚡️

---

## 🌟 Vision & Innovation
Traditional Agile planning takes days of manual story writing and task creation. **SprintX AI** automates this entire lifecycle, allowing Product Managers and Engineering leads to focus on code, not bureaucracy.

- **AI-Driven Epics & Stories**: Instantly extracts requirements from text/PDF files.
- **Dynamic Kanban Boards**: Collaborative, real-time status tracking.
- **Shared Project Links**: Publicly shareable boards for seamless team alignment.
- **Enterprise Governance**: Manager-led team onboarding and offboarding.

---

## 🛠️ Tech Stack
| Tier | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Render/Neon), Prisma ORM |
| **Generative AI**| Google Gemini 1.5 Pro / LLaMA 3.3 (Groq) |
| **Auth** | JWT (JSON Web Tokens) & Bcrypt |

---

## 🚀 Key Features
1.  **AI SRS Upload**: Drag-and-drop SRS files and watch as the AI generates hierarchical Epics, User Stories, and Tasks.
2.  **Shared Collaborative Boards**: Deep-link shared URLs (`/board/:id`) allow your entire squad to view progress instantly, even without accounts.
3.  **Jira-style Task Management**: Move tasks between `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE` with built-in review logic.
4.  **Team Offboarding**: Securely remove members from the "Team Squad" as they roll off projects.
5.  **Smart Redirections**: Authenticated users are seamlessly returned to shared projects after logging in.

---

## 📦 Local Setup
Follow these steps to run SprintX on your machine:

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/yadnesh-thorat/Sprint-AI.git
    cd Sprint-AI
    ```
2.  **Install Dependencies**:
    ```bash
    # Root
    npm install
    # Backend
    cd backend && npm install
    # Frontend
    cd ../frontend && npm install
    ```
3.  **Environment Variables**: Create a `.env` in `backend/` with:
    ```env
    DATABASE_URL="your_postgresql_url"
    JWT_SECRET="your_secret"
    GEMINI_API_KEY="your_api_key"
    ```
4.  **Push Database Schema**:
    ```bash
    cd backend
    npx prisma db push
    ```
5.  **Run Development Server**:
    ```bash
    # In the root folder
    npm run dev
    ```

---

## 🌍 Cloud Deployment (Render)
This project is pre-configured with a `render.yaml` Blueprint:
1.  Push your code to GitHub.
2.  Connect your repository to **Render Blueprint**.
3.  Sit back as Render provisions your DB, API, and Frontend automatically! 🌍🚀

---

## 🤝 Contributing
Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

**Built with ❤️ by yadnesh-thorat**
🏙️🚀
