import type { Metadata } from "next";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

import '@mantine/core/styles.css';
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const theme = createTheme({
  cursorType: 'pointer',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
