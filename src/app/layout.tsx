import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const revalidate = 600

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="w-[100vw] h-[100vh] bg-neutral-100 dark:bg-[#181818]">
				<ThemeProvider>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
