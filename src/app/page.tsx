"use client";

import { useSession } from "next-auth/react";
import AuthScreen from "@/components/AuthScreen";
import UserDashboard from "@/components/UserDashboard";
import TrainerDashboard from "@/components/TrainerDashboard";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated" || !session) {
    return <AuthScreen />;
  }

  if (session.user?.role === "TRAINER") {
    return <TrainerDashboard />;
  }

  return <UserDashboard />;
}
