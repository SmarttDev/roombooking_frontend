import { useEffect, useContext, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SymfoniContext, CurrentAddressContext } from '../hardhat/SymfoniContext'
import { ethers } from 'ethers'
import RoomBooking from '../artifacts/contracts/RoomBooking.sol/RoomBooking.json'
import { shorter } from 'utils'

const Header = () => {
  const [bookingCompanies, setBookingCompanies] = useState<string[]>([])
  const [currentAddress, setCurrentAddress] = useContext(CurrentAddressContext)
  const { init } = useContext(SymfoniContext)

  useEffect(() => {
    const fetchCompanies = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const roomBooking = new ethers.Contract(
          process.env.NEXT_PUBLIC_ROOM_BOOK_CONTRACT_ADDR as string,
          RoomBooking.abi,
          provider,
        )
        try {
          setBookingCompanies(await roomBooking.getCompanies())
        } catch (err) {
          console.log('Error: ', err)
        }
      }
    }

    fetchCompanies()
  }, [currentAddress])

  useEffect(() => {
    const onAccountsChanged = async (accounts) => {
      console.log('change')
      if (accounts.length) {
        setCurrentAddress(accounts[0])
      } else {
        setCurrentAddress('')
      }
    }

    const onChainChanged = async () => {
      window.location.reload()
    }

    window.ethereum?.on('accountsChanged', onAccountsChanged)
    window.ethereum?.on('chainChanged', onChainChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccountsChanged)
      window.ethereum?.removeListener('chainChanged', onChainChanged)
    }
  }, [currentAddress, setCurrentAddress])

  return (
    <header className="bg-white">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between border-b border-indigo-500 lg:border-none">
          <div className="flex items-center">
            <Link href="/" passHref>
              <a>
                <span className="sr-only">Workflow</span>
                <Image src="/logo.png" width={30} height={50} alt="logo" />
              </a>
            </Link>

            <div className="hidden ml-10 space-x-8 lg:block">
              {bookingCompanies.map((company) => (
                <Link key={company} href={company.toLowerCase()} passHref>
                  <a className="text-base font-medium text-black hover:text-gray-700">{company}</a>
                </Link>
              ))}
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <button
              className="inline-block bg-green-700 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75"
              onClick={async () => {
                await init()
              }}
            >
              {currentAddress ? shorter(currentAddress) : 'Connect wallet'}
            </button>
          </div>
        </div>
        <div className="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
          {bookingCompanies.map((company) => (
            <Link key={company} href={company.toLowerCase()} passHref>
              <a className="text-base font-medium text-black hover:text-gray-700">{company}</a>
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
