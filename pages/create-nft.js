/* eslint-disable no-underscore-dangle */
import { useEffect, useState, useMemo, useCallback, useContext } from 'react';
// import { create as ipfsHttpClient } from 'ipfs-http-client';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useAlert } from 'react-alert';

import { NFTContext } from '../context/NFTContext';
import { TMDBContext } from '../context/TMDBService';
import { Button, Input, Loader } from '../components';
import images from '../assets';

const CreateItem = () => {
  const { createToken, isLoadingNFT } = useContext(NFTContext);
  const { session, HasSession } = useContext(TMDBContext);
  const [fileUrl, setFileUrl] = useState(null);
  const { theme } = useTheme();
  const alert = useAlert();
  const router = useRouter();
  const minRoyalty = 0;
  const maxRoyalty = 50;

  useEffect(() => {
    if (session === '' || !HasSession()) {
      router.push('/');
    }
  }, [session, HasSession]);

  const uploadToPinata = async (file) => {
    try {
      const data = new FormData();
      data.append('file', file);

      const metadata = JSON.stringify({
        name: 'OttoMarket Image',
      });
      data.append('pinataMetadata', metadata);

      const res = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data,
        { maxBodyLength: 'Infinity',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            Authorization: `Bearer ${process.env.pinAuth}`,
          } },
      );
      console.log(res.data);
      setFileUrl(`https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`);
    } catch (error) {
      console.log(`error: ${error}`);
      alert.show(`Error uploading file: ${error}`, {
        type: 'error',
        onClose: () => {
          router.push('/');
        },
      });
    }
  };

  const onDrop = useCallback(async (acceptedFile) => {
    await uploadToPinata(acceptedFile[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: 'image/*',
    maxSize: 5000000,
  });

  // add tailwind classes acording to the file status
  const fileStyle = useMemo(
    () => (
      `dark:bg-nft-black-1 bg-white border dark:border-white border-nft-gray-2 flex flex-col items-center p-5 rounded-sm border-dashed  
       ${isDragActive ? ' border-file-active ' : ''} 
       ${isDragAccept ? ' border-file-accept ' : ''} 
       ${isDragReject ? ' border-file-reject ' : ''}`),
    [isDragActive, isDragReject, isDragAccept],
  );

  const [formInput, updateFormInput] = useState({ price: '', amount: '', royalties: '', name: '', description: '' });

  const createMarket = async () => {
    const { price, amount, royalties, name, description } = formInput;
    if (!name || !description || !price || !amount || !royalties || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      pinataMetadata: {
        name: 'OttoMarket Item',
      },
      pinataContent: {
        name,
        description,
        price,
        amount,
        image: fileUrl,
      },
    });

    try {
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

      await createToken(url, formInput.price, formInput.amount, formInput.royalties);
      router.push('/');
    } catch (error) {
      console.log(error.msg);
      alert.show(`Error uploading file: ${error}`, {
        type: 'error',
      });
    }
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
        <h1 className="font-roboto dark:text-white text-nft-black-1 font-semibold text-2xl">Create new item</h1>

        <div className="mt-16">
          <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xl">Upload file</p>
          <div className="mt-4">
            <div {...getRootProps()} className={fileStyle}>
              <input {...getInputProps()} />
              <div className="flexCenter flex-col text-center">
                <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-xl">JPG, PNG, GIF, SVG, WEBM, MP3, MP4. Max 100mb.</p>

                <div className="my-12 w-full flex justify-center">
                  <Image
                    src={images.upload}
                    width={100}
                    height={100}
                    objectFit="contain"
                    alt="file upload"
                    className={theme === 'light' ? 'filter invert' : undefined}
                  />
                </div>

                <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-sm">Drag and Drop File</p>
                <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-sm mt-2">Or browse media on your device</p>
              </div>
            </div>
            {fileUrl && (
              <aside>
                <div>
                  <Image
                    src={fileUrl}
                    alt="Asset_file"
                    width={400}
                    height={400}
                  />
                </div>
              </aside>
            )}
          </div>
        </div>

        <Input
          inputType="input"
          title="Name"
          placeholder="Asset Name"
          handleClick={(e) => updateFormInput({ ...formInput, name: e.target.value })}
        />

        <Input
          inputType="textarea"
          title="Description"
          placeholder="Asset Description"
          handleClick={(e) => updateFormInput({ ...formInput, description: e.target.value })}
        />

        <Input
          inputType="number"
          title="Price"
          placeholder="Asset Price"
          handleClick={(e) => updateFormInput({ ...formInput, price: e.target.value })}
        />

        <Input
          inputType="amount"
          title="Amount"
          placeholder="NFT Amount"
          handleClick={(e) => updateFormInput({ ...formInput, amount: e.target.value })}
        />

        <Input
          input="royalties"
          title="Royalties"
          placeholder="Royalties"
          handleClick={(e) => updateFormInput({ ...formInput, royalties: Math.max(minRoyalty, Math.min(maxRoyalty, Number(e.target.value))) })}
        />

        <div className="mt-7 w-full flex justify-end">
          <Button
            btnName="Create Item"
            btnType="primary"
            classStyles="rounded-xl"
            handleClick={createMarket}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateItem;
