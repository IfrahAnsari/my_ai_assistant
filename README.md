# 🚀 INFI | Next-Generation Multiplatform AI Voice Assistant

**INFI** is a high-fidelity, intelligent AI voice assistant designed to function seamlessly across both **mobile** and **desktop** platforms. Using a sleek dark glassmorphic design and the browser's native Web Speech API, INFI provides quick, hands-free interactions, mathematics execution, code solving, music streaming, and local desktop control.

---

## ✨ Key Features

1. **🎙️ Responsive Voice Interface**:
   - Web Speech API integration for high-accuracy Speech-to-Text and Text-to-Speech (TTS).
   - Audio feedback controls (toggle mute, speech rate, and language support).
   - A beautiful **dynamic canvas-based visualizer** that renders glowing neon waveforms reflecting the assistant's state (listening, speaking, thinking, or idle).

2. **🛠️ Multiplatform App & Website Opener**:
   - **Desktop Mode**: Integrates with a local Python backend to launch native applications directly (Chrome, Microsoft Word/Excel/Powerpoint, VS Code, Calculator, Paint, etc.) or open specific URLs.
   - **Mobile / Web Fallback**: Seamlessly detects offline/mobile states and redirects to web versions of popular platforms (Instagram, Office, Chrome Search, etc.) in a new tab.

3. **🔐 Secure & Full-Featured Authentication**:
   - Custom mock authentication system with full validation.
   - Login, registration, and "Forgot Password" flows (simulating 6-digit OTP verification and password resetting).
   - "Continue with Google" sign-in popup simulation.
   - Local storage session persistence.

4. **🧮 100% Precise Math Solver**:
   - Automatically intercepts mathematical requests (e.g. `89*89`, `879*76`, `(12+8)*5`) and calculates them with 100% accuracy using a safe local evaluator, avoiding AI hallucinations.

5. **🎵 Embedded Media Player**:
   - Say `"play song Shape of You"` or `"play song Shape of You"`.
   - On Desktop, opens the song on YouTube.
   - In the Web UI, displays a sliding "Now Playing" music card.

6. **💻 Specialized Code Solver & History Logs**:
   - Code Solver dashboard with templates for Python, JS, Go, CSS, and C++ that writes clean logic, renders code blocks with line-numbers, and supports copying.
   - History logs with search capabilities, type filtering (Voice, Text, Math, Code), and query rerun.

---

## 🏗️ Architecture

- **Frontend**: Built with **React 19 + Vite**, styled using premium, responsive **Vanilla CSS** (supporting glassmorphism and keyframe glowing effects).
- **Desktop Helper Backend**: Powered by **FastAPI** & **Uvicorn** in Python. Uses system modules to launch apps (`subprocess`), open default browsers (`webbrowser`), control system volume, capture screenshots (`Pillow`), lock workstation, and monitor real-time system CPU/RAM (`psutil`).

---

## 🚀 How to Run

### 1. Start the Desktop Helper Backend (Optional)
Run this on your desktop to enable native app launches, screenshots, volume controls, and lock screen commands:

```bash
# Install dependencies
pip install fastapi uvicorn psutil pillow python-multipart

# Start the server
python server.py
```
*The server will run on `http://127.0.0.1:5000`.*

### 2. Start the React Frontend
Run this on your development machine:

```bash
# Install node packages
npm install

# Start Vite dev server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### 3. Setup Gemini API Key
1. Go to **Settings** in the INFI Sidebar.
2. Input your **Google Gemini API Key**.
3. *Note: If no API key is specified, INFI runs in Local Mode (only predefined local actions, math calculations, and app launches will function).*
