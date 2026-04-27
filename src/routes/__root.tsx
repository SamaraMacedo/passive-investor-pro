import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AppLayout } from "@/components/AppLayout";
import { ensureSeed } from "@/lib/seed";
import { storage } from "@/lib/storage";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Investidor Passivo — Dashboard de Renda Passiva" },
      { name: "description", content: "Plataforma premium para controle de renda passiva, dividendos, FIIs e patrimônio." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => (
    <AppLayout><div className="text-center py-24"><h1 className="text-3xl font-bold">404</h1><p className="text-muted-foreground">Página não encontrada.</p></div></AppLayout>
  ),
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  useEffect(() => {
    ensureSeed();
    const t = storage.getSettings().theme;
    if (t === "dark") document.documentElement.classList.add("dark");
  }, []);
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
