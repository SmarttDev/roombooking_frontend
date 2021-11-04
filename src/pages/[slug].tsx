import { NextPage } from 'next'
import { Fragment, useEffect, useContext, useState } from 'react'
import { useRouter } from 'next/router'
import { RoomBookingContext, CurrentAddressContext } from '../hardhat/SymfoniContext'
import { ethers } from 'ethers'
import RoomBooking from '../artifacts/contracts/RoomBooking.sol/RoomBooking.json'
import useToast from 'hooks/useToast'
import { classNames, shorter } from 'utils'

interface Room {
  booked: boolean
  owner: string
}

const HomePage: NextPage = () => {
  const router = useRouter()
  const [maxRoom, setMaxRoom] = useState()
  const [, setMaxSlot] = useState()
  const [company, setCompany] = useState<string>()
  const [planning, setPlanning] = useState([])
  const roomBookingContract = useContext(RoomBookingContext)
  const [currentAddress] = useContext(CurrentAddressContext)
  const { toastError } = useToast()

  useEffect(() => {
    const doAsync = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const roomBooking = new ethers.Contract(
          process.env.NEXT_PUBLIC_ROOM_BOOK_CONTRACT_ADDR as string,
          RoomBooking.abi,
          provider,
        )
        try {
          const maxRoom = await roomBooking.MAX_ROOM()
          const maxSlot = await roomBooking.MAX_SLOT()
          const company = router.asPath.split('/')[1].toUpperCase()
          const planning = []
          for (let i = 0; i < maxSlot; i++) {
            if (!planning[i]) {
              //@ts-ignore
              planning[i] = []
            }
            for (let j = 0; j < maxRoom; j++) {
              //@ts-ignore
              planning[i].push(await roomBooking.roomlist(company, i, j))
            }
          }
          setMaxRoom(maxRoom)
          setMaxSlot(maxSlot)
          setPlanning(planning)
          setCompany(company)
        } catch (err) {
          console.log('Error: ', err)
        }
      }
    }
    doAsync()
  }, [router, roomBookingContract, currentAddress])

  const reserveRoomSpace = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    slotLineIndex: number,
    roomSpaceIndex: number,
  ) => {
    e.preventDefault()
    if (!roomBookingContract.instance) toastError('Error', 'Connect your wallet first')
    if (roomBookingContract.instance) {
      try {
        const tx = await roomBookingContract.instance.reserveRoomSpace(
          String(company),
          slotLineIndex,
          roomSpaceIndex,
        )
        await tx.wait()
        //@ts-ignore
        planning[slotLineIndex][roomSpaceIndex] = { booked: true, owner: currentAddress }
        setPlanning((oldPlanning) => [...oldPlanning])
      } catch (e: any) {
        toastError(e.message, e.data?.message)
      }
    }
  }

  const cancelRoomSpace = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    slotLineIndex: number,
    roomSpaceIndex: number,
  ) => {
    e.preventDefault()
    if (!roomBookingContract.instance) toastError('Error', 'Connect your wallet first')
    if (roomBookingContract.instance) {
      try {
        //@ts-ignore
        if (planning[slotLineIndex][roomSpaceIndex].owner !== currentAddress)
          throw new Error('Operation forbidden. Not owner of this room')
        const tx = await roomBookingContract.instance.cancelRoomSpace(
          String(company),
          slotLineIndex,
          roomSpaceIndex,
        )
        await tx.wait()

        planning[slotLineIndex][roomSpaceIndex] = {
          //@ts-ignore
          booked: false,
          //@ts-ignore
          owner: '0x0000000000000000000000000000000000000000',
        }
        setPlanning((oldPlanning) => [...oldPlanning])
      } catch (e: any) {
        toastError(e.message, e.data?.message)
      }
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main">
      <h1 className="text-lg font-bold text-center my-8">{company} Rooms</h1>
      <div className="mt-6 grid grid-cols-11 gap-0.5 lg:mt-8">
        <span className="text-center"> </span>
        {Array(maxRoom)
          .fill(1)
          .map((el, index) => (
            <span key={index} className="text-center">
              {company ? `${company[0]}${String(++index).padStart(2, '0')}` : ''}
            </span>
          ))}
      </div>
      <div className="mt-6 grid grid-cols-11 gap-0.5">
        {planning.map((slotLine: [], slotIndex: number) => {
          return (
            <Fragment key={slotIndex}>
              <span key={slotIndex} className="flex items-center justify-center text-center">
                {String(slotIndex + 9).padStart(2, '0')}H
              </span>
              {slotLine.map((room: Room, roomIndex: number) => (
                <button
                  key={roomIndex}
                  type="button"
                  className={classNames(
                    room.booked ? 'bg-red-300 hover:bg-red-500' : 'bg-green-300 hover:bg-green-500',
                    'col-span-1 flex justify-center py-6 text-sm',
                  )}
                  onClick={async (e) =>
                    //@ts-ignore
                    planning[slotIndex][roomIndex].booked === false
                      ? await reserveRoomSpace(e, slotIndex, roomIndex)
                      : await cancelRoomSpace(e, slotIndex, roomIndex)
                  }
                >
                  {room.booked ? shorter(room.owner) : '+'}
                </button>
              ))}
            </Fragment>
          )
        })}
      </div>
    </main>
  )
}
export default HomePage
