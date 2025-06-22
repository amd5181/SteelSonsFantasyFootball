import '../styles/globals.css';
import Header from '../components/Header';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <main className="pt-16 px-4">
        <Component {...pageProps} />
      </main>
    </>
  );
}
