import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BarChart3, ChevronRight } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema with more validation
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email address").optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
    },
  });
  
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Form Column */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">AlphaJournal</CardTitle>
            <CardDescription>
              Your complete day trading journal solution
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email (Optional)</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? "Creating account..." : "Register"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      {/* Hero Column */}
      <div className="hidden md:flex flex-1 bg-blue-600 text-white flex-col justify-center p-12">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Track, Analyze, Improve</h1>
          <p className="text-lg mb-8">
            TradeTrak helps you record your trades, analyze your performance, and become a more profitable trader through detailed insights and metrics.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-full mt-1">
                <ChevronRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Comprehensive Trade Journal</h3>
                <p className="text-blue-100">Log all your trades with detailed information and screenshots.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-full mt-1">
                <ChevronRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Analytics</h3>
                <p className="text-blue-100">Visualize your performance with detailed charts and metrics.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-500 p-2 rounded-full mt-1">
                <ChevronRight className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trading Journal</h3>
                <p className="text-blue-100">Document your thoughts, strategies, and market observations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
