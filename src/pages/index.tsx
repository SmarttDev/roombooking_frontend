import { useEffect, useContext, useState } from 'react'
import { RoomBookingContext, CurrentAddressContext } from '../hardhat/SymfoniContext'
import { ethers } from 'ethers'
import RoomBooking from '../artifacts/contracts/RoomBooking.sol/RoomBooking.json'
const roomBookAddress = process.env.NEXT_PUBLIC_ROOM_BOOK_CONTRACT_ADDR
import useToast from 'hooks/useToast'
import { shorter } from 'utils'

const HomePage: NextPage = () => {
  const roomBookingContract = useContext(RoomBookingContext)
  const [currentAddress] = useContext(CurrentAddressContext)
  const [bookingCompanies, setBookingCompanies] = useState([])
  const [inputAddress, setInputAddress] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const { toastSuccess, toastError } = useToast()

  useEffect(() => {
    const fetchCompanies = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const roomBooking = new ethers.Contract(roomBookAddress, RoomBooking.abi, provider)
        try {
          setBookingCompanies(await roomBooking.getCompanies())
        } catch (err) {
          console.log('Error: ', err)
        }
      }
    }

    fetchCompanies()
  }, [currentAddress])

  const addWhitelist = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (!roomBookingContract.instance) throw Error('RoomBooking instance not ready')
    if (roomBookingContract.instance) {
      try {
        const tx = await roomBookingContract.instance.addWhitelist(
          selectedCompany,
          inputAddress.toString(),
        )
        await tx.wait()
        toastSuccess(
          'Whitelist updated',
          `You successfully add ${shorter(inputAddress)} in ${selectedCompany} whitelist`,
        )
      } catch (e: any) {
        console.log(e)
        toastError(e.message, e.data?.message)
      }
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main">
      <div className="mx-auto w-1/2 my-32">
        <form>
          <fieldset className="mt-6 bg-white">
            <legend className="block text-sm font-medium text-gray-700">
              Add address in whitelist
            </legend>
            <div className="mt-1 rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="company" className="sr-only">
                  Company
                </label>
                <select
                  id="company"
                  name="company"
                  autoComplete="company-name"
                  className="focus:ring-green-500 focus:border-green-500 relative block w-full rounded-none rounded-t-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  onChange={(e) =>
                    setSelectedCompany(e.target.options[e.target.selectedIndex].value)
                  }
                >
                  <option value="">Choose a company</option>
                  {bookingCompanies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="walletAddress" className="sr-only">
                  Wallet Address
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  id="walletAddress"
                  autoComplete="walletAddress"
                  className="focus:ring-green-500 focus:border-green-500 relative block w-full rounded-none rounded-b-md bg-transparent focus:z-10 sm:text-sm border-gray-300"
                  placeholder="Wallet Address"
                  onChange={(e) => setInputAddress(e.target.value)}
                />
              </div>
            </div>
          </fieldset>
          <button
            className="flex justify-center mx-auto items-center mt-8 bg-black text-white px-8 py-2 rounded-md font-bold uppercase cursor-pointer disabled:opacity-10"
            onClick={async (e) => await addWhitelist(e)}
            disabled={!currentAddress}
          >
            <span>Valider</span>
          </button>
        </form>
      </div>
    </main>
  )
}
export default HomePage
