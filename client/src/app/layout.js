import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title: 'MentorConnect',
  description: 'Connect with mentors from top universities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
