import { useEffect, useMemo, useState } from "react";
// Carousel removed; render a single active card to avoid empty slides
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Feature = {
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
};

type AuthLayoutProps = {
  heading: string;
  subheading?: string;
  cta?: React.ReactNode;
  children: React.ReactNode;
  features?: Feature[];
  leftTitle?: string;
  leftSubtitle?: string;
  logo?: React.ReactNode;
};

export const AuthLayout = ({
  heading,
  subheading,
  cta,
  children,
  features: featuresProp,
  leftTitle = "Welcome",
  leftSubtitle = "A better way to manage your work",
  logo,
}: AuthLayoutProps) => {
  const features: Feature[] = useMemo(
    () =>
      featuresProp ?? [
        {
          title: "Stay organized",
          description:
            "Keep everything in one place and move faster with clarity.",
          stats: [
            { label: "Time saved", value: "+18h" },
            { label: "Happier teams", value: "92%" },
            { label: "Workflows", value: "100+" },
          ],
        },
        {
          title: "Smart automation",
          description:
            "Automate repetitive tasks and focus on what matters most.",
        },
        {
          title: "Share effortlessly",
          description:
            "Create beautiful updates and reports with a single click.",
        },
      ],
    [featuresProp]
  );

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(id);
  }, [features.length]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 p-8 overflow-hidden">
        {/* Dark, rich gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_700px_at_10%_10%,rgba(99,102,241,0.18),transparent_60%),radial-gradient(800px_600px_at_90%_110%,rgba(45,212,191,0.12),transparent_55%),radial-gradient(600px_500px_at_50%_-10%,rgba(17,24,39,0.6),transparent_60%)]" />
        {/* Fine grid texture */}
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:38px_38px] opacity-20" />

        <div className="relative z-10 mb-4 flex items-center gap-2">
          {logo ?? (
            <>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 font-bold">
                @
              </span>
              <span className="text-xl font-semibold tracking-tight">
                InsightMiner
              </span>
            </>
          )}
        </div>

        <div className="relative z-10  max-w-md">
          <h1 className="text-base md:text-lg font-medium leading-snug text-zinc-200">
            {leftTitle}
          </h1>
          <p className="text-2xl md:text-3xl font-semibold mt-1.5 text-white">
            {leftSubtitle}
          </p>
        </div>

        <div className="relative z-10 mt-4 w-full max-w-md">
          <Card className="bg-white/5 backdrop-blur border-white/10 text-zinc-100">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-white/10 border-white/20 text-zinc-100">
                  Feature
                </Badge>
                <span className="text-zinc-300 text-xs">Rotating</span>
              </div>
              <h3 className="text-xl font-semibold">
                {features[active]?.title}
              </h3>
              <p className="text-zinc-300 mt-1">
                {features[active]?.description}
              </p>
              {features[active]?.stats && (
                <div className="grid grid-cols-3 gap-2.5 mt-4">
                  {features[active]!.stats!.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-md border border-white/10 p-3 bg-white/5"
                    >
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-xs text-zinc-300">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-3 flex items-center justify-center gap-2">
            {features.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setActive(idx)}
                className={
                  "h-1.5 w-5 rounded-full transition-colors " +
                  (idx === active ? "bg-zinc-100" : "bg-zinc-500/40")
                }
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-6 text-center text-sm text-zinc-400">
          Private and secure. Your data stays yours.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{heading}</h2>
            {subheading && (
              <p className="text-muted-foreground mt-1">{subheading}</p>
            )}
          </div>
          {children}
          {cta && (
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {cta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
