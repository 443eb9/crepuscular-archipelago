import { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import PixivBackground from "@/components/pixiv-background"
import { Toaster } from "react-hot-toast"

export const revalidate = 600

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="w-[100vw] h-[100vh] bg-light-background dark:bg-dark-background overflow-x-clip text-light-contrast dark:text-dark-contrast">
				{/* <PixivBackground /> */}
				<Toaster
					toastOptions={{
						className: "border-2 border-light-contrast dark:border-dark-contrast backdrop-blur-md text-light-contrast dark:text-dark-contrast",
						style: {
							borderRadius: 0,
							backgroundColor: "#00000000"
						}
					}}
				/>
				<ThemeProvider attribute="class">
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
