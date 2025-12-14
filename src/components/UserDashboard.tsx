"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSWRWithAuth } from "@/lib/swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  Unlock,
  Users,
  TrendingUp,
  Calendar,
  Star,
  User,
} from "lucide-react";

export default function UserDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { data: plans } = useSWRWithAuth("/api/plans");
  const { data: subscriptions, mutate: mutateSubscriptions } = useSWRWithAuth(
    "/api/subscriptions"
  );
  const { data: feed } = useSWRWithAuth("/api/feed");

  /* ... inside component ... */
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("success")) {
      alert("Payment successful! You are now subscribed.");
      mutateSubscriptions(); // Refresh subscriptions
      router.replace("/"); // Clear params
    }

    if (searchParams.get("canceled")) {
      alert("Payment canceled.");
      router.replace("/"); // Clear params
    }
  }, [searchParams, router, mutateSubscriptions]);

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Subscription failed");
      }
    } catch (error) {
      alert("Subscription failed");
    }
  };

  const handleFollow = async (trainerId: string) => {
    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId }),
      });

      if (response.ok) {
        alert("Successfully followed trainer!");
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      alert("Follow failed");
    }
  };

  const isSubscribed = (planId: string) => {
    return subscriptions?.some((sub: any) => sub.planId === planId);
  };

  const subscribedPlanIds = subscriptions?.map((sub: any) => sub.planId) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">User Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <Button onClick={() => signOut()} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="explore">Explore Plans</TabsTrigger>
            <TabsTrigger value="my-plans">My Plans</TabsTrigger>
            <TabsTrigger value="feed">My Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="explore" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Explore Fitness Plans</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans?.map((plan: any) => {
                const subscribed = isSubscribed(plan.id);
                return (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={plan.trainer.avatar} />
                          <AvatarFallback>
                            {plan.trainer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {plan.trainer.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Certified Trainer
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      <CardDescription>
                        {subscribed
                          ? plan.description
                          : `${plan.description.slice(0, 100)}...`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary">{plan.duration} days</Badge>
                        <span className="text-lg font-semibold text-green-600">
                          ${plan.price}
                        </span>
                      </div>

                      {!subscribed && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                          <Lock className="h-4 w-4" />
                          Subscribe to view full plan
                        </div>
                      )}

                      {subscribed && (
                        <div className="flex items-center gap-2 mb-3 text-sm text-green-600">
                          <Unlock className="h-4 w-4" />
                          You have access to this plan
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          variant={subscribed ? "secondary" : "default"}
                          onClick={() =>
                            subscribed
                              ? setSelectedPlan(plan)
                              : handleSubscribe(plan.id)
                          }
                        >
                          {subscribed ? "View Plan" : "Subscribe"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFollow(plan.trainer.id)}
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="my-plans" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">My Subscribed Plans</h2>
            {subscriptions?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">
                    You haven't subscribed to any plans yet.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Explore plans to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions?.map((sub: any) => (
                  <Card key={sub.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={sub.plan.trainer.avatar} />
                          <AvatarFallback>
                            {sub.plan.trainer.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {sub.plan.trainer.name}
                          </p>
                          <p className="text-xs text-gray-600">Your Trainer</p>
                        </div>
                      </div>
                      <CardTitle className="text-lg">
                        {sub.plan.title}
                      </CardTitle>
                      <CardDescription>{sub.plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary">
                          {sub.plan.duration} days
                        </Badge>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedPlan(sub.plan)}
                      >
                        View Full Plan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feed" className="mt-6">
            <h2 className="text-2xl font-bold mb-6">Your Personalized Feed</h2>

            {feed?.followedPlans?.length === 0 &&
            feed?.subscribedPlans?.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">Your feed is empty.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Follow trainers to see their latest plans!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {feed?.followedPlans?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Plans from Trainers You Follow
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {feed?.followedPlans?.map((plan: any) => (
                        <Card key={plan.id}>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={plan.trainer.avatar} />
                                <AvatarFallback>
                                  {plan.trainer.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {plan.trainer.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Trainer you follow
                                </p>
                              </div>
                            </div>
                            <CardTitle className="text-lg">
                              {plan.title}
                            </CardTitle>
                            <CardDescription>
                              {plan.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="secondary">
                                {plan.duration} days
                              </Badge>
                              <span className="text-lg font-semibold text-green-600">
                                ${plan.price}
                              </span>
                            </div>
                            <Button
                              className="w-full"
                              variant={
                                plan.subscriptions?.length > 0
                                  ? "secondary"
                                  : "default"
                              }
                              onClick={() =>
                                plan.subscriptions?.length > 0
                                  ? setSelectedPlan(plan)
                                  : handleSubscribe(plan.id)
                              }
                            >
                              {plan.subscriptions?.length > 0
                                ? "View Plan"
                                : "Subscribe"}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {feed?.subscribedPlans?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Your Active Plans
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {feed?.subscribedPlans?.map((plan: any) => (
                        <Card key={plan.id}>
                          <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={plan.trainer.avatar} />
                                <AvatarFallback>
                                  {plan.trainer.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">
                                  {plan.trainer.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Your Trainer
                                </p>
                              </div>
                            </div>
                            <CardTitle className="text-lg">
                              {plan.title}
                            </CardTitle>
                            <CardDescription>
                              {plan.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="secondary">
                                {plan.duration} days
                              </Badge>
                              <Badge variant="default">Active</Badge>
                            </div>
                            <Button
                              className="w-full"
                              onClick={() => setSelectedPlan(plan)}
                            >
                              View Full Plan
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Plan Details Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.title}</DialogTitle>
            <DialogDescription>
              Created by {selectedPlan?.trainer?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedPlan.trainer.avatar} />
                  <AvatarFallback>
                    {selectedPlan.trainer.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedPlan.trainer.name}</p>
                  <p className="text-sm text-gray-600">Certified Trainer</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Plan Description</h4>
                <p className="text-gray-700">{selectedPlan.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Duration: {selectedPlan.duration} days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Price: ${selectedPlan.price}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-green-600 font-medium">
                  ✓ You have full access to this plan
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
