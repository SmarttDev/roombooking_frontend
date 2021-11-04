import React, { ReactNode } from 'react'
import dynamic from 'next/dynamic'

type Props = {
  children?: ReactNode
}

const DynamicHeader = dynamic(() => import('components/Header'))
const DynamicFooter = dynamic(() => import('components/Footer'))

const Layout = ({ children }: Props) => {
  return (
    <div>
      <DynamicHeader />
      {children}
      <DynamicFooter />
    </div>
  )
}

export default Layout
