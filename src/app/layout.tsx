import ContentWrapper from "@/components/common/content-wrapper";
import Footer from "@/components/common/footer";
import Providers from "@/components/provider";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className="pb-5 h-full">
        <div className="fixed w-full h-full -z-50 bg-neutral-100 dark:bg-[#181818]"></div>
        <Providers>{children}</Providers>
        <Toaster></Toaster>
        <ContentWrapper className="my-5">
          <Footer></Footer>
        </ContentWrapper>
      </body>
    </html>
  );
}
