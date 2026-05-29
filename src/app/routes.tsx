import { createBrowserRouter } from "react-router";
import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import AuthScreen from "./screens/AuthScreen";
import TalentSelectionScreen from "./screens/TalentSelectionScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ExploreScreen from "./screens/ExploreScreen";
import CollaborationScreen from "./screens/CollaborationScreen";
import MessagingScreen from "./screens/MessagingScreen";
import OpportunitiesScreen from "./screens/OpportunitiesScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import SettingsScreen from "./screens/SettingsScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SplashScreen />,
  },
  {
    path: "/onboarding",
    element: <OnboardingScreen />,
  },
  {
    path: "/auth",
    element: <AuthScreen />,
  },
  {
    path: "/talents",
    element: <TalentSelectionScreen />,
  },
  {
    path: "/home",
    element: <HomeScreen />,
  },
  {
    path: "/profile/:userId",
    element: <ProfileScreen />,
  },
  {
    path: "/explore",
    element: <ExploreScreen />,
  },
  {
    path: "/collaborate",
    element: <CollaborationScreen />,
  },
  {
    path: "/messages",
    element: <MessagingScreen />,
  },
  {
    path: "/opportunities",
    element: <OpportunitiesScreen />,
  },
  {
    path: "/notifications",
    element: <NotificationsScreen />,
  },
  {
    path: "/settings",
    element: <SettingsScreen />,
  },
]);
