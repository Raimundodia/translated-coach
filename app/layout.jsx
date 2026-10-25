import './globals.css';

export const metadata = {
  title: 'PitchLingo Pro | Inglês Tático para Treinadores',
  description: 'Assistente tático com inteligência artificial para treinadores executarem comandos de beira de campo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
