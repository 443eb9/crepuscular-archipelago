import Providers from "@/components/provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="" lang="en" suppressHydrationWarning>
      <body className="scrollbar-light scrollbar-dark bg-neutral-100 dark:bg-neutral-900 cursor-default">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
