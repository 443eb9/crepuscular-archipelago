import { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="bg-light-0 dark:bg-dark-0">
				<ThemeProvider>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
