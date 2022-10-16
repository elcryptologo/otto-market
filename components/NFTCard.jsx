import { useContext } from 'react';
import Link from 'next/link';

import images from '../assets';
import { NFTContext } from '../context/NFTContext';
import { shortenAddress } from '../utils/shortenAddress';

const NFTCard = ({ nft, onProfilePage }) => {
  if (nft.name === '') return;

  const { nftCurrency } = useContext(NFTContext);

  return (
    <Link href={{ pathname: '/nft-details', query: nft }}>
      <div className="flex-1 min-w-215 max-w-max xs:max-w-none sm:w-full sm:min-w-155 minmd:min-w-256 minlg:min-w-327 dark:bg-nft-black-3 bg-white rounded-2xl p-4 m-4 minlg:m-8 sm:my-2 sm:mx-2 cursor-pointer shadow-md">
        <div className="relative w-full h-52 sm:h-36 xs:h-56 minmd:h-60 minlg:h-300 rounded-2xl overflow-hidden">
          <img src={nft.image || images[`nft${nft.i}`]} width={200} objectFit="cover" alt="nft01" />
        </div>
        <div className="mt-3 flex flex-col">
          <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">{nft.name}</p>
          <div className="mt-1 minlg:mt-3 xs:flex-col xs:items-start xs:mt-3">
            <div className="flex-col">
              <div className="flexBetween mt-1 minlg:mt-3 flex-row xs:flex-col xs:items-start xs:mt-3">
                <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg">{nft.price}<span className="font-normal"> {nftCurrency}</span></p>
                <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg">{nft.amount - nft.sold} of {nft.amount}</p>
                <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg">{shortenAddress(onProfilePage ? nft.owner : nft.seller)}</p>
              </div>
              {/* <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg"><span className="font-normal">owner:</span> {shortenAddress(nft.owner)} </p>
              <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg"><span className="font-normal">seller:</span> {shortenAddress(nft.seller)} </p>
              <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xs minlg:text-lg"><span className="font-normal">sold:</span> {nft.sold} </p> */}
            </div>
          </div>
          <div className="mt-1 minlg:mt-3 flexBetween flex-row" />
        </div>
      </div>
    </Link>
  );
};

export default NFTCard;
