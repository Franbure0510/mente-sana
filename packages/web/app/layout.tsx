import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
// import RobotAssistant from "@/components/robot-assistant"; // eliminado temporalmente
import VoiceBot from "@/components/voice-bot";

export const metadata: Metadata = {
  title: "Mente Sana — Bienestar Emocional",
  description: "Cultiva tu paz, encuentra tu equilibrio. Diario, ejercicios, comunidad y apoyo con IA para tu bienestar emocional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <VoiceBot />
          <main style={{ minHeight: '100vh', padding: '0 0 80px 0', maxWidth: 840, margin: '0 auto' }}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
