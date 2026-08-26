import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import logo from "@/assets/logo.asset.json";
import { bakery, menu } from "@/data/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sugar Sorcery — Magic in Every Bite | Kharghar Bakery" },
      {
        name: "description",
        content:
          "Sugar Sorcery is a pre-order bakery in Kharghar, Navi Mumbai — bombolonis, cookies, brownies, cakes and basque cheesecakes. Order online.",
      },
      {
        property: "og:title",
        content: "Sugar Sorcery — Magic in Every Bite",
      },
      {
        property: "og:description",
        content:
          "Pre-order bombolonis, cookies, brownies, cakes and basque cheesecakes from Sugar Sorcery, Kharghar, Navi Mumbai.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <img
            src={logo.url}
            alt="Sugar Sorcery logo"
            className="h-40 w-40 rounded-full object-cover ring-1 ring-primary-foreground/25 sm:h-52 sm:w-52"
            style={{ objectPosition: "50% 28%" }}
            width={288}
            height={407}
          />

          <h1 className="brand-title mt-8 text-5xl leading-[1.05] sm:text-6xl">
            Sugar Sorcery
          </h1>
          <p className="mt-4 font-display text-2xl italic tracking-wide sm:text-3xl">
            {bakery.tagline}
          </p>
          <p className="mt-5 max-w-xl text-sm uppercase tracking-[0.25em] opacity-80">
            {bakery.menuTagline}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/menu"
              className="rounded-full bg-primary-foreground px-8 py-3 text-sm uppercase tracking-[0.18em] text-primary"
            >
              Order now
            </Link>
            <a
              href={bakery.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/60 px-8 py-3 text-sm uppercase tracking-[0.18em]"
            >
              <MessageCircle className="h-4 w-4" /> Enquire
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
        <InfoTile icon={<MapPin className="h-5 w-5" />} title="Where we bake">
          {bakery.address}
        </InfoTile>
        <InfoTile icon={<Clock className="h-5 w-5" />} title="Opening status">
          {bakery.hours}
        </InfoTile>
        <InfoTile icon={<Sparkles className="h-5 w-5" />} title="Orders">
          {bakery.orders} · 24 hours prior
        </InfoTile>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl text-primary">The Menu</h2>
          <div className="ornament-rule flex-1" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((category) => (
            <Link
              key={category.id}
              to="/menu"
              hash={category.id}
              className="rounded-xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/60"
            >
              <h3 className="text-2xl text-primary">{category.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {category.products.length} flavours
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl text-primary">Enquiries</h2>
          <div className="ornament-rule flex-1" />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <a
            href={bakery.phoneHref}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-5 hover:border-primary/60"
          >
            <Phone className="h-5 w-5 text-primary" />
            <span className="text-primary">{bakery.phone}</span>
          </a>
          <a
            href={bakery.whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-5 hover:border-primary/60"
          >
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-primary">WhatsApp</span>
          </a>
          <a
            href={`mailto:${bakery.email}`}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-5 hover:border-primary/60"
          >
            <Mail className="h-5 w-5 shrink-0 text-primary" />
            <span className="break-all text-primary">{bakery.email}</span>
          </a>
        </div>
      </section>
    </div>
  );
}

function InfoTile({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-6">
      <span className="text-primary">{icon}</span>
      <h3 className="mt-3 text-xl text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
