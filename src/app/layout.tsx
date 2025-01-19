import { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const revalidate = 600

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="w-[100vw] h-[100vh] bg-light-background dark:bg-dark-background overflow-x-clip text-light-contrast dark:text-dark-contrast">
				<ThemeProvider attribute="class">
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
