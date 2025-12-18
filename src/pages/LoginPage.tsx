import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import type { LoginFormValues } from "@/lib/validations";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const { error } = await signIn(data.email, data.password);
    if (error) {
      toast.error(error.message);
    } else {
      navigate({ to: "/" });
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md px-6 py-20">
        {/* Header */}
        <section className="mb-12">
          <p className="text-muted-foreground mb-6 text-sm uppercase tracking-wider">
            Welcome back
          </p>
          <h1 className="text-xl font-medium leading-relaxed">
            Sign in to continue practicing.
          </h1>
        </section>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mb-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : "border-border"}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={
                errors.password ? "border-destructive" : "border-border"
              }
            />
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-4 text-sm text-muted-foreground">
              or
            </span>
          </div>
        </div>

        {/* Google */}
        <Button
          variant="outline"
          className="w-full mb-8"
          onClick={handleGoogleSignIn}
        >
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-foreground hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </Layout>
  );
}
