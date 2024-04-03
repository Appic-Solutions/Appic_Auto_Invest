import { Inter } from 'next/font/google';
import '@/styles/style.scss';
import Background from '@/components/higerOrderComponents/background';
import Sidebar from '@/components/sidebar';
import WalletConnectM from '@/components/walletConnectModal';
import Portfolio from '@/components/portfolio';
import { ReduxProvider } from '@/providers/reduxProvider';
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Appic',
  description: 'Appic souloutions, Auto invest(DCA) on IC',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <Sidebar />
          <Background>
            <WalletConnectM />
            <Portfolio />
            {children}
          </Background>
        </ReduxProvider>
      </body>
    </html>
  );
}

