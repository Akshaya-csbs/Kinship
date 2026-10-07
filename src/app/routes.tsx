import { ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import AuthScreen from "./screens/AuthScreen";
import TalentSelectionScreen from "./screens/TalentSelectionScreen";
import HomeScreen from "./screens/HomeScreen";
import { CreatorProfileScreen } from "./screens/CreatorProfileScreen";
import ExploreScreen from "./screens/ExploreScreen";
import CollaborationScreen from "./screens/CollaborationScreen";
import MessagingScreen from "./screens/MessagingScreen";
import OpportunitiesScreen from "./screens/OpportunitiesScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SystemStatusScreen from "./screens/SystemStatusScreen";
import RequireAuth from "./components/RequireAuth";

const protectedRoute = (element: ReactNode) => <RequireAuth>{element}</RequireAuth>;

export const router = createBrowserRouter([
  { path: "/", element: <SplashScreen /> },
  { path: "/onboarding", element: <OnboardingScreen /> },
  { path: "/auth", element: <AuthScreen /> },
  { path: "/talents", element: protectedRoute(<TalentSelectionScreen />) },
  { path: "/home", element: protectedRoute(<HomeScreen />) },
  { path: "/profile/:id", element: protectedRoute(<CreatorProfileScreen />) },
  { path: "/explore", element: protectedRoute(<ExploreScreen />) },
  { path: "/collaborate", element: protectedRoute(<CollaborationScreen />) },
  { path: "/messages", element: protectedRoute(<MessagingScreen />) },
  { path: "/messages/:userId", element: protectedRoute(<MessagingScreen />) },
  { path: "/opportunities", element: protectedRoute(<OpportunitiesScreen />) },
  { path: "/notifications", element: protectedRoute(<NotificationsScreen />) },
  { path: "/settings", element: protectedRoute(<SettingsScreen />) },
  { path: "/system", element: <SystemStatusScreen /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);
