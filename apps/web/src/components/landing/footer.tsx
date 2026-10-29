import { Link } from "@tanstack/react-router";

import { githubUrl } from "./links";

const sections = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Platform", href: "#features" },
      { label: "Billing", href: "#billing" },
      { label: "Who it's for", href: "#who-its-for" },
      { label: "Architecture", href: "#architecture" },
      { label: "Roadmap", href: "#roadmap" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: githubUrl },
      { label: "Issues", href: `${githubUrl}/issues` },
      { label: "Releases", href: `${githubUrl}/releases` },
      { label: "License", href: `${githubUrl}/blob/main/LICENSE` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
        <div>
          <Link to="/" className="font-semibold tracking-tight">
            quilt
          </Link>
          <p className="mt-2 max-w-xs text-muted-foreground text-sm">
            A self-hosted PaaS for businesses that want their own platform on
            their own servers.
          </p>
          <p className="mt-6 text-muted-foreground text-xs">
            Apache-2.0 licensed. Alpha software, not for production yet. Hosting
            quilt? This is its default home page, so make it your own.
          </p>
        </div>
        {sections.map(({ title, links }) => (
          <div key={title}>
            <p className="font-medium text-sm">{title}</p>
            <ul className="mt-3 space-y-2 text-muted-foreground text-sm">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="hover:text-foreground">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
