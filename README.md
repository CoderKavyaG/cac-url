# CAC URL 

A professional, enterprise-grade URL shortening and management platform built for performance and scalability. This application provides advanced analytics, custom aliases, and seamless link management for individuals and teams, powered by a modern tech stack.

## ✨ Key Features

*   **Smart URL Shortening**: Instantly generate short, shareable links with a high-performance engine.
*   **Custom Branding**: Create personalized aliases (e.g., `your.link/campaign`) to enhance brand visibility.
*   **Deep Analytics**: Gain insights into user behavior with detailed tracking of clicks, referrers, and timestamps.
*   **QR Code Generator**: Automatically generate downloadable QR codes for every link to bridge digital and physical marketing.
*   **Security & Safety**: Built-in rate limiting and secure authentication to protect your data.
*   **Link Recovery**: Safety net features including soft-deletes and a 30-day recovery window for accidental removals.
*   **Responsive Dashboard**: A fully responsive interface that provides a seamless experience across desktop and mobile devices.

## 🛠️ Technology Stack

Built with a focus on reliability and developer experience:

*   **Frontend**: React 19, Vite, Tailwind CSS 4, Recharts
*   **Backend**: Node.js, Express 5, Sequelize ORM
*   **Database**: PostgreSQL (Neon.tech Serverless)
*   **Authentication**: Secure JWT & bcrypt implementation

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js 18+
*   npm or yarn
*   A [Neon.tech](https://neon.tech) account (or any PostgreSQL database)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/cac-url.git
    cd cac-url
    ```

2.  **Configure Environment**
    *   Navigate to the `backend` folder and create a `.env` file based on `.env.example`.
    *   Add your Database URL and JWT Secret.
    *   Navigate to the `frontend` folder and create a `.env` file for API configuration.

3.  **Install Dependencies & Run**

    **Backend:**
    ```bash
    cd backend
    npm install
    npm run dev
    ```

    **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Application**
    Open your browser and navigate to `http://localhost:5173`.

## 📖 Usage

### Dashboard
The main dashboard provides a snapshot of your recent activity, including total clicks and top-performing links.

### Creating a Link
Simply paste your long URL into the input field. Optionally, provide a custom alias to make it memorable.

### Analytics
Click on any link in your dashboard to view detailed analytics graphs, helping you understand when and how your links are being accessed.

## 🤝 Contributing

We welcome contributions! Please follow standard open-source conventions:

1.  Fork the repository.
2.  Create a feature branch.
3.  Commit your changes.
4.  Push to your fork and submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

---

*Built with performance and scalability in mind.*
