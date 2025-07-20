# 🎬 ScreenSquad

**Watch videos together in perfect sync with your friends!**

ScreenSquad is a real-time video synchronization platform that allows you to create watch parties with friends. Whether it's YouTube videos, Google Drive content, or screen sharing, everyone stays perfectly in sync.

![ScreenSquad Demo](https://via.placeholder.com/800x400/1f2937/ffffff?text=ScreenSquad+Demo)

## ✨ Features

### 🎥 **Multi-Platform Video Support**
- **YouTube Integration**: Seamless YouTube video embedding and playback
- **Google Drive Videos**: Direct support for Google Drive video files
- **Screen Sharing**: Real-time screen sharing with HD quality
- **Direct Video Files**: Support for MP4, WebM, and other video formats

### 👥 **Squad Management**
- **Create Squads**: Set up private watch parties with custom names
- **Role-Based Access**: Host controls vs. member view-only permissions
- **Real-time Sync**: Automatic synchronization across all viewers
- **Member Management**: See who's online and their roles

### 💬 **Interactive Features**
- **Live Chat**: Real-time messaging during video sessions
- **Reaction System**: Quick emoji reactions to moments
- **Activity Feed**: Track squad activity and chat history

### 🎛️ **Host Controls**
- **Video Library Management**: Add, remove, and organize videos
- **Playback Control**: Play, pause, and seek for all members
- **Screen Share**: Share your screen with the entire squad
- **Sync Management**: Ensure everyone stays perfectly synchronized

### 🔒 **User Experience**
- **Modern UI**: Clean, dark theme optimized for video watching
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Authentication**: Secure user accounts and squad access
- **Real-time Updates**: Instant updates without page refreshes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RayendraNagata/ScreenSquad.git
   cd ScreenSquad
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the development servers**
   
   **Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5174`
   - Backend API: `http://localhost:3000`

### Quick Start Scripts

For convenience, you can use the provided batch files:

```bash
# Windows users
.\setup.bat      # Install all dependencies
.\start-dev.bat  # Start both servers
```

## 🎮 How to Use

### Creating a Squad
1. Sign up or log in to your account
2. Click "Create Squad" on the dashboard
3. Give your squad a name and description
4. Share the squad link with friends

### Adding Videos
1. Open your squad as a host
2. Click "Manage Videos" to open the video library
3. Click "Add Video" and paste a YouTube or Google Drive URL
4. Your video will appear in the library with thumbnail

### Starting a Watch Party
1. Select a video from the library
2. The video will load in the Squad Theater
3. Use the host controls to play, pause, or seek
4. All members will automatically sync with your actions

### Screen Sharing
1. Click "Share Screen" in the video manager
2. Grant permission when prompted
3. Select the screen/window to share
4. Your screen will appear live for all squad members

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Key Features Implementation
- **Real-time Sync**: WebSocket-based synchronization
- **Video Embedding**: YouTube/Google Drive API integration
- **Screen Sharing**: WebRTC getDisplayMedia API
- **Responsive Design**: Mobile-first Tailwind CSS

## 📁 Project Structure

```
ScreenSquad/
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & rate limiting
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── socket/          # Socket.io handlers
│   │   └── utils/           # Utility functions
│   └── server.js           # Server entry point
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── chat/       # Chat system
│   │   │   ├── squad/      # Squad management
│   │   │   ├── ui/         # UI components
│   │   │   └── video/      # Video player & manager
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── store/          # State management
│   │   └── utils/          # Frontend utilities
│   └── index.html         # Entry HTML
│
├── docs/                  # Documentation
├── setup.bat             # Windows setup script
├── start-dev.bat         # Windows dev server script
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend (.env):**
```env
PORT=3000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### Browser Requirements

- **Chrome 72+** (recommended for screen sharing)
- **Firefox 66+**
- **Safari 13+**
- **Edge 79+**

**Note**: Screen sharing requires HTTPS in production or localhost for development.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🐛 Known Issues

- Screen sharing may not work on all browsers
- Large video files may take time to sync initially
- Mobile experience is optimized but desktop is recommended

## 📞 Contact & Support

- **GitHub**: [RayendraNagata/ScreenSquad](https://github.com/RayendraNagata/ScreenSquad)
- **Discord**: `fallininfall` for questions and support
- **Issues**: Report bugs via [GitHub Issues](https://github.com/RayendraNagata/ScreenSquad/issues)

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** team for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **Socket.io** for real-time communication
- **YouTube API** for video embedding capabilities

---

**Made with ❤️ by [RayendraNagata](https://github.com/RayendraNagata)**

*Happy watching together! 🍿*
