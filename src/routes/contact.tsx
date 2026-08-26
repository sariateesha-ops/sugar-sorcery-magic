import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { bakery } from "@/data/menu";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location — Sugar Sorcery, Kharghar" },
      {
        name: "description",
        content:
          "Call or WhatsApp 7710865577, email ishitagupte00@gmail.com, or find Sugar Sorcery in Kharghar, Navi Mumbai.",
      },
      { property: "og:title", content: "Contact Sugar Sorcery" },
      {
        property: "og:description",
        content:
          "Enquiries by phone, WhatsApp or email. Sugar Sorcery is based in Kharghar, Navi Mumbai.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <header className="text-center">
        <h1 className="brand-title text-4xl text-primary sm:text-5xl">Get in Touch</h1>
        <p className="mt-3 font-display text-xl text-muted-foreground">
          {bakery.orders} · {bakery.hours}
        </p>
      </header>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <a
          href={bakery.phoneHref}
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/60"
        >
          <Phone className="h-5 w-5 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Call
            </span>
            <span className="text-lg text-primary">{bakery.phone}</span>
          </span>
        </a>

        <a
          href={bakery.whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/60"
        >
          <MessageCircle className="h-5 w-5 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              WhatsApp
            </span>
            <span className="text-lg text-primary">{bakery.phone}</span>
          </span>
        </a>

        <a
          href={`mailto:${bakery.email}`}
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/60"
        >
          <Mail className="h-5 w-5 shrink-0 text-primary" />
          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Email
            </span>
            <span className="block break-all text-lg text-primary">{bakery.email}</span>
          </span>
        </a>

        <a
          href={bakery.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/60"
        >
          <Instagram className="h-5 w-5 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Instagram
            </span>
            <span className="text-lg text-primary">@sugar_sorcery_</span>
          </span>
        </a>
      </div>

      <section className="mt-12 rounded-xl border border-border/70 bg-card p-6">
        <h2 className="flex items-center gap-3 text-2xl text-primary">
          <MapPin className="h-5 w-5" /> Location
        </h2>
        <p className="mt-2 text-muted-foreground">{bakery.address}</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" /> {bakery.hours}
        </p>

        {bakery.mapsUrl ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-border/70">
            <iframe
              title="Sugar Sorcery location map"
              src={bakery.mapsUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full"
            />
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-primary/40 p-8 text-center text-sm text-muted-foreground">
            The map will appear here once your Google Maps link is added
            (<code>mapsUrl</code> in <code>src/data/menu.ts</code>).
          </div>
        )}
      </section>
    </div>
  );
}
