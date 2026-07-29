import "./globals.css";

export const metadata = {
  title: "Atelier — Wardrobe Studio",
  description: "Professional wardrobe interior planning workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
