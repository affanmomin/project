import { LoginForm } from "@/components/auth/LoginForm";
import AuthLayout from "@/components/layout/auth-layout";

const features = [
  {
    title: "Spot competitor momentum in real time",
    description:
      "Monitor mentions, sentiment, and trending themes across Reddit, X, and review sites—no manual triage.",
    stats: [
      { value: "37%", label: "Faster market reads" },
      { value: "18h", label: "Weekly time saved" },
      { value: "243+", label: "Brands tracked" },
    ],
  },
  {
    title: "Turn complaints into clear priorities",
    description:
      "Auto-cluster pain points and quantify impact so product and marketing know what to fix first.",
    stats: [
      { value: "3x", label: "Faster prioritization" },
      { value: "92%", label: "Team alignment" },
      { value: "100+", label: "Ready-made insights" },
    ],
  },
  {
    title: "Capture buyers ready to switch",
    description:
      "See who’s evaluating alternatives, why they’re leaving, and route hot leads directly to sales.",
    stats: [
      { value: "+28%", label: "Win-rate lift" },
      { value: "<24h", label: "Lead routing" },
      { value: "5min", label: "Setup time" },
    ],
  },
];

export default function LoginPage() {
  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your command center"
      leftTitle="Marketing intelligence for teams that move fast"
      leftSubtitle="Track competitors, capture switching leads, and turn complaints into roadmap wins."
      features={features}
      cta={
        <p>
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
