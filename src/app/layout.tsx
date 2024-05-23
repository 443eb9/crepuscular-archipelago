import Providers from "@/components/provider";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="" lang="en" suppressHydrationWarning>
      <body className="pb-5">
        <div className="fixed w-full h-full -z-50 bg-neutral-100 dark:bg-[#181818]"></div>
        <Providers>{children}</Providers>
        <Toaster></Toaster>
      </body>
    </html>
  );
}
