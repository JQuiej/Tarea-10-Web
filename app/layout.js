import './globals.css';

export const metadata = {
  title: 'Prestamo de Videojuegos',
  description: 'Administracion de una coleccion de videojuegos y sus prestamos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
