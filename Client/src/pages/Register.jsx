import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/components/ui/notification";

export default function RegisterPage() {
      const navigate = useNavigate();
      const base_url = import.meta.env.VITE_BACKEND_URL;

      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [loading, setLoading] = useState(false);
      const { success, error } = useNotification();

      const handleRegister = async (e) => {
            e.preventDefault();
            setLoading(true);
            

            try {
                  const res = await axios.post(`${base_url}/register`, {
                        name,
                        email,
                        password,
                  }, { withCredentials: true }
);

                  if (res.status === 200) {
                        success('Verification code sent to your email. Please verify.', 'Registered');
                        setTimeout(() => {
                              navigate("/verify-email", { state: { email } });
                        }, 2000);
                  }
            } catch (err) {
                  console.log(err.response);
                  error(err.response?.data?.message || 'Something went wrong', 'Registration failed');
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                  <Card className="w-full max-w-sm">
                        <CardHeader className="space-y-1">
                              <CardTitle className="text-2xl font-bold text-center">Register</CardTitle>
                              <CardDescription className="text-center">
                                    Enter your details to create an account
                              </CardDescription>
                        </CardHeader>
                        <CardContent>
                              <form className="space-y-4" onSubmit={handleRegister}>
                                    <div className="space-y-2">
                                          <Label htmlFor="name">Name</Label>
                                          <Input
                                                id="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                          />
                                    </div>

                                    <div className="space-y-2">
                                          <Label htmlFor="email">Email</Label>
                                          <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                          />
                                    </div>

                                    <div className="space-y-2">
                                          <Label htmlFor="password">Password</Label>
                                          <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                          />
                                    </div>

                                    <Button
                                          type="submit"
                                          className="w-full"
                                          disabled={loading}
                                    >
                                          {loading ? "Registering..." : "Register"}
                                    </Button>

                                    {/* Notifications appear as floating cards; no inline message. */}

                                    <p className="text-center text-sm mt-2">
                                          Already have an account?
                                          <button
                                                type="button"
                                                onClick={() => navigate("/login")}
                                                className="ml-2 text-blue-600 hover:underline"
                                          >
                                                Login
                                          </button>
                                    </p>
                              </form>
                        </CardContent>
                  </Card>
            </div>
      );
}