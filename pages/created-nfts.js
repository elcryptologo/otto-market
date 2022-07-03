import { useEffect, useState, useContext } from 'react';
import { useAlert } from 'react-alert';
import Image from 'next/image';

import { useRouter } from 'next/router';
import { NFTContext } from '../context/NFTContext';
import { TMDBContext } from '../context/TMDBService';
import { shortenAddress } from '../utils/shortenAddress';
import { Loader, NFTCard, Banner } from '../components';
import images from '../assets';

const CreatorDashboard = () => {
  const alert = useAlert();
  const router = useRouter();
  const { fetchMyNFTsOrCreatedNFTs, currentAccount } = useContext(NFTContext);
  const { session, userName, GetGravatarURL } = useContext(TMDBContext);
  const avatarImg = GetGravatarURL();
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session === '') {
      alert.show('Please login first.', {
        type: 'error',
        onClose: () => { router.push('/'); },
      });
    }
  }, [session]);

  useEffect(() => {
    fetchMyNFTsOrCreatedNFTs('fetchItemsListed')
      .then((items) => {
        setNfts(items);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isLoading && nfts.length === 0) {
    return (
      <div className="flexCenter sm:p-4 p-16 min-h-screen">
        <h1 className="font-roboto dark:text-white text-nft-black-1 text-3xl font-extrabold">No NFTs Listed for Sale</h1>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start items-center flex-col min-h-screen">
      <div className="w-full minmd:w-4/5">
        <Banner
          name="NFTs Listed with Otto"
          childStyles="text-center mb-4"
          parentStyle="h-80 justify-center"
        />
        <div className="flexCenter flex-col -mt-20 z-0">
          <div className="flexCenter w-40 h-40 sm:w-36 sm:h-36 p-1 bg-nft-black-2 rounded-full">
            {(session && avatarImg)
              ? (<Image loader={() => avatarImg} width={200} height={200} src={avatarImg} className="rounded-full object-cover" objectFit="cover" />
              ) : (<Image src={images.creator1} className="rounded-full object-cover" objectFit="cover" />)}
          </div>
          <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-2xl mt-6">{(session) ? (userName) : (shortenAddress(currentAccount))}</p>
        </div>
      </div>
      <div className="sm:px-4 p-12 w-full minmd:w-4/5 flexStart flex-col">
        <h2 className="font-roboto dark:text-white text-nft-black-1 text-2xl justify-start mt-2 ml-4 sm:ml-2 font-semibold">NFTs You Have Listed for Sale</h2>
        <div className="mt-3 w-full flex flex-wrap justify-start md:justify-center">
          {nfts.map((nft) => <NFTCard key={`nft-${nft.tokenId}`} nft={nft} />)}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
