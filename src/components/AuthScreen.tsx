"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSWRWithAuth } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dumbbell, Users, TrendingUp, Star, Lock } from "lucide-react";

export default function AuthScreen() {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    role: "USER" as "USER" | "TRAINER",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { data: plans } = useSWRWithAuth("/api/plans");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: true,
        email: loginData.email,
        password: loginData.password,
        callbackUrl: "/",
      });

      if (result?.error) {
        alert("Invalid credentials");
      }
    } catch (error) {
      alert("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login after register
        await signIn("credentials", {
          redirect: true,
          email: registerData.email,
          password: registerData.password,
          callbackUrl: "/",
        });
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">FitPlanHub</h1>
          </div>
          <p className="text-xl text-gray-600">
            Connect with expert trainers and achieve your fitness goals
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Auth Forms */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Welcome to FitPlanHub</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="reg-name">Full Name</Label>
                        <Input
                          id="reg-name"
                          type="text"
                          value={registerData.name}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              name: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-email">Email</Label>
                        <Input
                          id="reg-email"
                          type="email"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              email: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-password">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">I am a...</Label>
                        <select
                          id="role"
                          value={registerData.role}
                          onChange={(e) =>
                            setRegisterData({
                              ...registerData,
                              role: e.target.value as "USER" | "TRAINER",
                            })
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="USER">
                            User looking for fitness plans
                          </option>
                          <option value="TRAINER">Certified Trainer</option>
                        </select>
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Featured Plans */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Featured Fitness Plans</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {plans?.slice(0, 3).map((plan: any) => (
                <Card key={plan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={plan.trainer.avatar} />
                            <AvatarFallback>
                              {plan.trainer.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">
                            {plan.trainer.name}
                          </span>
                        </div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">
                            {plan.duration} days
                          </Badge>
                          <span className="text-sm font-semibold text-green-600">
                            ${plan.price}
                          </span>
                        </div>
                      </div>
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold mb-2">Demo Accounts:</h3>
              <div className="text-sm space-y-1">
                <p>
                  <strong>Trainer:</strong> john@trainer.com / trainer123
                </p>
                <p>
                  <strong>User:</strong> alice@example.com / user123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
