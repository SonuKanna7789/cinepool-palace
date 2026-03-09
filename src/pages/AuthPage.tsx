import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Film, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(128),
});

const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "At least 2 characters").max(100),
});

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, signIn } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const schema = mode === "register" ? registerSchema : loginSchema;
    const parsed = schema.safeParse(
      mode === "register" ? { name, email, password } : { email, password }
    );

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await signUp(email.trim(), password, name.trim());
        toast.success("Account created! Please check your email to verify your account.");
      } else {
        await signIn(email.trim(), password);
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      const msg = err?.message?.includes("Invalid login credentials")
        ? "Invalid email or password"
        : err?.message?.includes("User already registered")
        ? "Email already registered"
        : err?.message?.includes("Email not confirmed")
        ? "Please check your email and click the confirmation link"
        : err?.message || "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2">
        <Film size={28} className="text-primary" />
        <h1 className="font-display font-bold text-3xl text-gold-gradient">CinePool</h1>
      </div>
      <p className="text-xs text-muted-foreground mb-8">
        Discover, review &amp; split your streams
      </p>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-2xl p-6 glow-gold">
        {/* Tab toggle */}
        <div className="flex rounded-xl bg-muted p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErrors({}); }}
              className={`flex-1 rounded-lg py-2 text-sm font-display font-semibold transition-all ${
                mode === m
                  ? "gradient-gold text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                maxLength={100}
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              maxLength={255}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-secondary px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-gold py-3 text-sm font-display font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>

      <p className="text-[11px] text-muted-foreground mt-6">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); }}
          className="text-primary font-medium hover:underline"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
