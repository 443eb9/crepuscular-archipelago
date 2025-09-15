import { ReactNode } from "react"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="cmn-hans" suppressHydrationWarning>
			<body className="bg-light-0 dark:bg-dark-0">
				<Toaster
					toastOptions={{
						className: "border-2 border-dark-0 dark:border-light-0 backdrop-blur-md text-light-0 dark:text-dark-0",
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
