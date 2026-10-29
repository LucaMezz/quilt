import { Link } from "@tanstack/react-router";

import { githubUrl } from "./landing/links";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const sections = [
  { hash: "features", label: "Platform" },
  { hash: "billing", label: "Billing" },
  { hash: "architecture", label: "Architecture" },
  { hash: "roadmap", label: "Roadmap" },
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid size-5 grid-cols-2 gap-0.5">
              <span className="rounded-[2px] bg-primary" />
              <span className="rounded-[2px] bg-primary/40" />
              <span className="rounded-[2px] bg-primary/40" />
              <span className="rounded-[2px] bg-primary" />
            </span>
            quilt
          </Link>
          <nav className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
            {sections.map(({ hash, label }) => (
              <Link
                key={hash}
                to="/"
                hash={hash}
                className="hover:text-foreground"
              >
                {label}
              </Link>
            ))}
            <a href={githubUrl} className="hover:text-foreground">
              GitHub
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
