import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { logo } from "@/assets/brand";
import { bakery } from "@/data/menu";

export function SiteFooter() {
  const navigate = useNavigate();
  const taps = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hint, setHint] = useState(false);

  // Hidden owner entrance: tap the bakery name in the footer strip 5 times.
  function secretTap() {
    taps.current += 1;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      taps.current = 0;
      setHint(false);
    }, 2000);
    if (taps.current >= 3) setHint(true);
    if (taps.current >= 5) {
      taps.current = 0;
      setHint(false);
      void navigate({ to: "/admin/login" });
    }
  }

  return (
    <footer className="mt-20 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo.url}
              alt="Sugar Sorcery logo"
              className="h-12 w-12 rounded-full object-cover"
              style={{ objectPosition: "50% 34%" }}
            />
            <span className="brand-title text-2xl text-primary">{bakery.name}</span>
          </div>
          <p className="mt-3 font-display text-lg text-muted-foreground">
            {bakery.tagline}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="text-lg text-primary">Visit &amp; Enquire</h3>
          <p className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {bakery.address}
          </p>
          <a
            href={bakery.phoneHref}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Phone className="h-4 w-4 text-primary" />
            {bakery.phone}
          </a>
          <a
            href={bakery.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <MessageCircle className="h-4 w-4 text-primary" />
            WhatsApp {bakery.phone}
          </a>
          <a
            href={`mailto:${bakery.email}`}
            className="flex items-center gap-2 break-all text-muted-foreground hover:text-primary"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            {bakery.email}
          </a>
          <a
            href={bakery.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Instagram className="h-4 w-4 text-primary" />
            Instagram
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <h3 className="text-lg text-primary">Orders</h3>
          <p className="text-muted-foreground">{bakery.hours}</p>
          <p className="text-muted-foreground">{bakery.orders}</p>
          <p className="text-muted-foreground">
            Place your orders at least 24 hours prior.
          </p>
          <div className="flex gap-4 pt-2">
            <Link to="/menu" className="text-primary hover:underline">
              Menu
            </Link>
            <Link to="/cart" className="text-primary hover:underline">
              Cart
            </Link>
            <Link to="/contact" className="text-primary hover:underline">
              Contact
            </Link>
          </div>
          <Link
            to="/admin/login"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] text-muted-foreground hover:border-primary hover:text-primary"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Access
          </Link>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span
          onClick={secretTap}
          className="cursor-default select-none"
          aria-label={`${bakery.name} footer`}
        >
          {bakery.name}
        </span>{" "}
        — {bakery.menuTagline}
        {hint && (
          <span className="ml-2 normal-case tracking-normal text-primary">
            owner login…
          </span>
        )}
      </div>
    </footer>
  );
}
