import '../styles/globals.css';
import Header from '../components/Header';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <main className="p-0 m-0">
        <Component {...pageProps} />
      </main>
    </>
  );
}
