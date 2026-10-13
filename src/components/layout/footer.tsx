import Link from "next/link";
import { FOOTER_LINKS, APP_NAME } from "@/lib/constants";
import { Logo } from "./logo";
import { Globe, MessageCircle, Heart, Mail } from "lucide-react";

const socialLinks = [
  { icon: Mail, href: "mailto:vm9678974@gmail.com", label: "Email Support" },
  { icon: Globe, href: "https://github.com/armourking-12/helpjouniours", label: "GitHub" },
  { icon: MessageCircle, href: "https://twitter.com", label: "Twitter" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-foreground bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-border">
          <div className="lg:pr-8">
            <Logo size="md" />
            <p className="mt-4 text-xs font-mono leading-relaxed text-muted-foreground">
              Your AI-powered student resource sharing platform. Upload, discover, and
              download academic materials with ease.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-background text-foreground transition-colors hover:bg-foreground hover:text-background"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:pl-8">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              Platform
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pl-8">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pl-8">
            <h3 className="font-mono text-xs font-black uppercase tracking-widest text-foreground">
              Legal
            </h3>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t-2 border-foreground pt-6 font-mono text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Built with <Heart className="h-3.5 w-3.5 fill-current text-foreground" /> for
            students
          </p>
        </div>
      </div>
    </footer>
  );
}
