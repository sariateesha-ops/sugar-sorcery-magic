import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { bakery, menu } from "@/data/menu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Sugar Sorcery Bakery, Kharghar" },
      {
        name: "description",
        content:
          "Browse the Sugar Sorcery menu: bombolonis, cookies, brownies, classic cakes and basque cheesecakes. Pre-order only.",
      },
      { property: "og:title", content: "Menu — Sugar Sorcery" },
      {
        property: "og:description",
        content:
          "Bombolonis, cookies, brownies, classic cakes and basque cheesecakes, made to order in Kharghar, Navi Mumbai.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <header className="text-center">
        <h1 className="brand-title text-4xl text-primary sm:text-5xl">Our Menu</h1>
        <p className="mt-3 font-display text-xl text-muted-foreground">
          {bakery.menuTagline}
        </p>
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-primary/80">
          {bakery.orders} · Place your orders at least 24 hours prior
        </p>
      </header>

      <nav className="mt-8 flex flex-wrap justify-center gap-2">
        {menu.map((category) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className="rounded-full border border-primary/30 px-4 py-2 text-xs uppercase tracking-[0.15em] text-primary hover:bg-primary/10"
          >
            {category.name}
          </a>
        ))}
      </nav>

      {menu.map((category) => (
        <section key={category.id} id={category.id} className="mt-16 scroll-mt-24">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl text-primary">{category.name}</h2>
            <div className="ornament-rule flex-1" />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {category.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
