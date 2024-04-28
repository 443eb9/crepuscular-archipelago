import Providers from "@/components/provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="" lang="en" suppressHydrationWarning>
      <body className="cursor-default pb-5">
        <div className="fixed w-full h-full -z-50 bg-neutral-100 dark:bg-[#181818]"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
