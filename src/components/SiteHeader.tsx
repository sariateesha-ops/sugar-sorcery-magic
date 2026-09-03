import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { logo } from "@/assets/brand";
import { bakery } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { useCustomer } from "@/lib/customer-session";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { itemCount } = useCart();
  const { customer, signedIn, loading, signOut } = useCustomer();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSignOut() {
    signOut();
    setAccountOpen(false);
    setOpen(false);
    void navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src={logo.url}
            alt="Sugar Sorcery logo"
            className="h-11 w-11 rounded-full object-cover"
            style={{ objectPosition: "50% 34%" }}
          />
          <span className="brand-title text-2xl text-primary sm:text-[1.7rem]">
            {bakery.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="text-sm uppercase tracking-[0.18em] transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? null : signedIn ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                aria-label="Account"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
              >
                <User className="h-4 w-4" />
                <span className="hidden max-w-28 truncate sm:inline">
                  {customer?.name.split(" ")[0] ?? "Account"}
                </span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border/70 bg-card shadow-lg">
                  <Link
                    to="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/5"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/5"
                  >
                    My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/5"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm uppercase tracking-[0.18em] text-primary"
            >
              {item.label}
            </Link>
          ))}
          {signedIn && (
            <>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block px-6 py-3 text-sm uppercase tracking-[0.18em] text-primary"
              >
                Profile
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setOpen(false)}
                className="block px-6 py-3 text-sm uppercase tracking-[0.18em] text-primary"
              >
                My Orders
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full px-6 py-3 text-left text-sm uppercase tracking-[0.18em] text-destructive"
              >
                Sign Out
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
