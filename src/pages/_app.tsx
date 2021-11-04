import { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import { Symfoni } from '../hardhat/SymfoniContext'
import { ToastsProvider } from 'contexts/ToastsContext'

import 'styles/index.css'

const Layout = dynamic(() => import('components/Layout'))
const ToastListener = dynamic(() => import('components/ToastListener'))

const MyApp = ({ Component, pageProps, router }: AppProps) => {
  return (
    <>
      <Symfoni
        autoInit={false}
        loadingComponent={
          <div className="inset-0 h-screen flex justify-center items-center">LOADING...</div>
        }
      >
        <ToastsProvider>
          <Layout>
            <Component {...pageProps} key={router.route} />
          </Layout>
          <ToastListener />
        </ToastsProvider>
      </Symfoni>
    </>
  )
}

export default MyApp
