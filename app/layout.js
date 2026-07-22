import './globals.css';
export const metadata = {
  title: 'The Ride — A Guided Wellbeing Journey',
  description: 'A guided journey of reflection, practice, and steadier rhythm — one passage at a time.',
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
