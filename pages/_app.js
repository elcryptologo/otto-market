// import Script from 'next/script';
import { ThemeProvider } from 'next-themes';
import { Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import { TMDBProvider } from '../context/TMDBService';
import { NFTProvider } from '../context/NFTContext';
import { Footer, Navbar } from '../components';
import '../styles/globals.css';

const options = {
  position: 'top center',
  timeout: 5000,
  offset: '30px',
  transition: 'scale',
};

const Marketplace = ({ Component, pageProps }) => (
  <AlertProvider template={AlertTemplate} {...options}>
    <TMDBProvider>
      <NFTProvider>
        <ThemeProvider attribute="class">
          <div className="dark:bg-nft-dark bg-white min-h-screen">
            <Navbar />
            <div className="pt-65">
              <Component {...pageProps} />
            </div>
            <Footer />
          </div>

          {/* <Script src="https://kit.fontawesome.com/d45b25ceeb.js" crossorigin="anonymous" /> */}
        </ThemeProvider>
      </NFTProvider>
    </TMDBProvider>
  </AlertProvider>
);

export default Marketplace;
