import type { NavigationContent } from "@dalizebo/types";
import Link from "next/link";

export function SiteFooter({ navigation }: { navigation: NavigationContent }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="eyebrow">Dalizebo Commerce</p>
          <p className="footer-statement">
            Smarter commerce. Limitless possibilities.
          </p>
          <p className="fine-print">
            South African by design. Built for every channel.
          </p>
        </div>
        {navigation.footerGroups.map((group) => (
          <div key={group.title}>
            <h2>{group.title}</h2>
            <div className="footer-links">
              {group.links.map((link) => (
                <Link href={link.href} key={`${link.label}-${link.href}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
