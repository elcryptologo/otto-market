import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import { useAlert } from 'react-alert';
import Image from 'next/image';
import axios from 'axios';

import { NFTContext } from '../context/NFTContext';
import { TMDBContext } from '../context/TMDBService';
import { Button, Loader } from '../components';

const ResellNFT = () => {
  const { resellToken, isLoadingNFT, nftCurrency } = useContext(NFTContext);
  const { session } = useContext(TMDBContext);
  const alert = useAlert();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const router = useRouter();
  const { id, tokenURI, amount, price } = router.query;

  useEffect(() => {
    if (session === '') {
      alert.show('Please login first.', {
        type: 'error',
        onClose: () => {
          router.push('/');
        },
      });
    }
  }, [session]);

  const fetchNFT = async () => {
    if (!tokenURI) return;

    const { data } = await axios.get(tokenURI);

    setName(data.name);
    setImage(data.image);
    setDescription(data.description);
  };

  useEffect(() => {
    fetchNFT();
  }, [id]);

  const resell = async () => {
    if (!name || !description || !amount || !price || !image) {
      console.log(`name: ${name} desc: ${description} price: ${price}`);
      return;
    }

    const data = JSON.stringify({
      pinataMetadata: {
        name: 'OttoMarket Resell Item',
      },
      pinataContent: {
        name,
        description,
        price,
        amount,
        image,
      },
    });

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.pinAuth}`,
        },
      },
    );

    console.log(res.data);
    const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;

    console.log('before resellToken in resell in resell-nft');
    await resellToken(id, url, price);
    console.log('after resellToken in resell in resell-nft');

    router.push('/');
  };

  if (isLoadingNFT) {
    return (
      <div className="flexCenter" style={{ height: '51vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex justify-center sm:px-4 p-12">
      <div className="w-3/5 md:w-full">
        <h1 className="font-roboto dark:text-white text-nft-black-1 font-semibold text-4xl">Resell NFT</h1>
        <div className="flex flex-row sm:flex-col">
          <h2 className="font-roboto dark:text-white text-nft-black-1 font-bold text-2xl minlg:text-3xl">{name}</h2>
        </div>
        <div className="mt-3">
          <p className="font-roboto dark:text-white text-nft-black-1 font-normal text-base">
            {description}
          </p>
        </div>
        <div className="mt-3">
          <p className="font-roboto dark:text-white text-nft-black-1 font-normal text-base">
            Listing {amount} token{amount > 1 ? 's' : ''} at {price} {nftCurrency}
          </p>
        </div>

        {image && <Image className="rounded mt-4" width={350} height={350} src={image} />}

        <div className="mt-7 flex flex-none grid-cols-2 gap-40 justify-start sm:flex-col">
          <Button
            btnName="Cancel"
            btnType="outline"
            classStyles="rounded-lg"
            handleClick={() => router.push('/my-nfts')}
          />
          <Button
            btnName="List NFT"
            btnType="primary"
            classStyles="rounded-xl"
            handleClick={resell}
          />
        </div>
      </div>
    </div>
  );
};

export default ResellNFT;
