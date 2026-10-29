import { Link } from "@tanstack/react-router";

import { githubUrl } from "./landing/links";
import { ModeToggle } from "./mode-toggle";
import { SiteHeader } from "./site-header";
import UserMenu from "./user-menu";

const sections = [
  { hash: "features", label: "Platform" },
  { hash: "billing", label: "Billing" },
  { hash: "architecture", label: "Architecture" },
  { hash: "roadmap", label: "Roadmap" },
] as const;

export default function Header() {
  return (
    <SiteHeader
      nav={
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
      }
      actions={
        <>
          <ModeToggle />
          <UserMenu />
        </>
      }
    />
  );
}
