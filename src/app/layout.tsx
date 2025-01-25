import { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import PixivBackground from "@/components/pixiv-background";
import { Toaster } from "react-hot-toast";

export const revalidate = 600

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="w-[100vw] h-[100vh] bg-light-background dark:bg-dark-background overflow-x-clip text-light-contrast dark:text-dark-contrast">
				<PixivBackground />
				<Toaster />
				<ThemeProvider attribute="class">
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
