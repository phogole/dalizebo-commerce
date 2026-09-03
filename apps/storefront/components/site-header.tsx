import type { NavigationContent } from "@dalizebo/types";
import Link from "next/link";

export function SiteHeader({ navigation }: { navigation: NavigationContent }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          className="brand-mark"
          href="/"
          aria-label="Dalizebo Commerce home"
        >
          <span className="brand-symbol">D</span>
          <span>
            <strong>Dalizebo</strong>
            <small>Commerce</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.primaryLinks.map((link) => (
            <Link href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="utility-nav">
          <Link href="/search" aria-label="Search products">
            Search
          </Link>
          {navigation.utilityLinks.map((link) => (
            <Link href={link.href} key={`${link.label}-${link.href}`}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
