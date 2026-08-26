import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import logo from "@/assets/logo.asset.json";
import { bakery } from "@/data/menu";

export function SiteFooter() {
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
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {bakery.name} — {bakery.menuTagline}
      </div>
    </footer>
  );
}
