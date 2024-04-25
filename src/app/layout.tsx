import Providers from "@/components/provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-neutral-100 dark:bg-neutral-900 cursor-default">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
