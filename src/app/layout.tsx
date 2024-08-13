import Providers from "@/components/provider";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className="h-full pb-5 bg-neutral-100 dark:bg-[#181818]">
        <Providers>{children}</Providers>
        <Toaster></Toaster>
      </body>
    </html>
  );
}
