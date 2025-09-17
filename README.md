<<<<<<< HEAD
# SpineGuard - Posture Monitoring Application UI

A modern, desktop-based posture monitoring application UI built with React and Tailwind CSS. Designed with a dark theme inspired by modern health tech applications, featuring real-time posture monitoring, voice alerts, and model management.

## 🎯 Features

### 🔐 Authentication
- Clean login page with username/password fields
- Multiple user profile support
- Subtle spine illustration in background
- Smooth animations and transitions

### 📊 Main Dashboard
- **Real-time Posture Status**: Large indicator showing "Good Posture" or "Bad Posture" with color-coded backgrounds
- **Animated Spine Visualization**: 3D-style spine that changes color (green for good, red for bad posture)
- **Today's Accuracy**: Circular progress indicator showing posture accuracy percentage
- **Control Buttons**: Start/Stop monitoring, calibrate good/bad posture
- **Live Updates**: Simulated real-time posture monitoring with visual feedback

### 🔊 Voice & Alert Settings
- Enable/disable voice alerts toggle
- Choose between voice or beep sounds
- Adjustable alert threshold (1-20 bad samples)
- Volume control slider
- Desktop notifications toggle
- Test alert functionality

### 🧠 Model Management
- Upload custom posture detection models (.pkl, .joblib, .h5, .onnx)
- Train new models with simulated training process
- View model accuracy, size, and training date
- Set active model from available options
- Delete unwanted models
- Model statistics dashboard

### 🎨 Design Features
- **Dark Mode**: Sleek dark theme with subtle gradients
- **Color Palette**: Whites, cool greys, mint green, light blue
- **Typography**: Inter and Poppins fonts for modern readability
- **Animations**: Smooth transitions using Framer Motion
- **Glass Morphism**: Subtle glass-card effects with backdrop blur
- **Responsive**: Optimized for desktop applications

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spineguard-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── LoginPage.jsx          # Authentication page
│   ├── Dashboard.jsx          # Main dashboard with all features
│   ├── SpineIllustration.jsx  # Animated spine visualization
│   ├── VoiceAlertSettings.jsx # Voice and alert configuration
│   └── ModelManagement.jsx    # Model upload and management
├── App.jsx                    # Main app with routing and dark mode
├── App.css                    # Custom animations and styles
├── index.css                  # Tailwind CSS and global styles
└── main.jsx                   # React entry point
```

## 🎨 Design System

### Colors
- **Primary**: `#3B82F6` (Spine Blue)
- **Success**: `#10B981` (Spine Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Spine Red)
- **Mint**: `#6EE7B7` (Spine Mint)
- **Dark**: `#0F172A` (Spine Dark)
- **Gray**: `#64748B` (Spine Gray)

### Components
- **Glass Cards**: Semi-transparent cards with backdrop blur
- **Status Indicators**: Color-coded posture status with animations
- **Control Buttons**: Interactive buttons with hover and tap animations
- **Sliders**: Custom styled range inputs for settings
- **Toggles**: Animated switch components

## 🔧 Customization

### Adding New Features
1. Create new components in the `src/components/` directory
2. Import and use them in the Dashboard component
3. Follow the existing design patterns and color scheme

### Modifying Styles
- Update `tailwind.config.js` for theme customization
- Modify `src/index.css` for global styles
- Use Tailwind classes for component-specific styling

### Adding Animations
- Use Framer Motion for component animations
- Follow existing animation patterns in the codebase
- Maintain smooth transitions and performance

## 🔌 Backend Integration

This UI is designed to work with a backend API. Key integration points:

- **Authentication**: Login endpoint for user verification
- **Posture Data**: Real-time posture monitoring data
- **Model Management**: File upload and model training endpoints
- **Settings**: User preference storage and retrieval

## 📱 Responsive Design

The application is optimized for desktop use with:
- Minimum width of 1024px for optimal experience
- Flexible grid layouts that adapt to screen size
- Scalable components and typography
- Touch-friendly controls for touchscreen devices

## 🎯 Future Enhancements

- Real-time data integration with wearable sensors
- Advanced analytics and reporting
- User profile management
- Export functionality for posture data
- Multi-language support
- Accessibility improvements

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository or contact the development team.

---

**SpineGuard** - Protecting your spinal health with modern technology. 🦴✨
=======
# Spineguard
>>>>>>> 0bfc03798e408d134067f3040c421c7fa6d13ed9
