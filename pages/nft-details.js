import { useState, useEffect, useContext, useRef } from 'react';
import { useAlert } from 'react-alert';
import { useRouter } from 'next/router';
import Image from 'next/image';

import { NFTContext } from '../context/NFTContext';
import { TMDBContext } from '../context/TMDBService';
import { shortenAddress } from '../utils/shortenAddress';
import { Button, Loader, Input, Modal } from '../components';
import images from '../assets';

const PaymentBodyCmp = ({ nft, nftCurrency, amount }) => (
  <div className="flex flex-col">
    <div className="flexBetween">
      <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Item</p>
      <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Amount</p>
      <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Each</p>
    </div>

    <div className="flexBetweenStart my-5">
      <div className="flex-col flexStartCenter">
        <div className="relative w-28 h-28">
          <Image src={nft.image || images[`nft${nft.i}`]} layout="fill" objectFit="cover" />
        </div>
        <div className="flexStartCenter content-end mt-2 flex-col">
          <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-sm minlg:text-xl">{shortenAddress(nft.seller)}</p>
          <p className="font-roboto dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal">{nft.name}</p>
        </div>
      </div>

      <div>
        <p className="font-roboto dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal">{amount} </p>
      </div>

      <div>
        <p className="font-roboto dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal">{nft.price} <span className="font-semibold">{nftCurrency}</span></p>
      </div>
    </div>

    <div className="flexBetween mt-10">
      <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-base minlg:text-xl">Total</p>
      <p className="font-roboto dark:text-white text-nft-black-1 text-base minlg:text-xl font-normal">{parseFloat(nft.price * amount).toFixed(1)} <span className="font-semibold">{nftCurrency}</span></p>
    </div>
  </div>
);

const AssetDetails = () => {
  const { nftCurrency, buyNft, currentAccount, isLoadingNFT } = useContext(NFTContext);
  const { session, GetGravatarURL } = useContext(TMDBContext);
  const [nft, setNft] = useState({ price: '', tokenId: '', tokenCreator: '', amount: '', sold: '', seller: '', owner: '', image: '', name: '', description: '', tokenURI: '' });
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const amountRef = useRef(null);
  const priceRef = useRef(null);
  const router = useRouter();
  const alert = useAlert();
  const [avatarImg, setAvatarImg] = useState('');

  useEffect(() => {
    if (session === '') {
      alert.show('Please login first.', {
        type: 'error',
        onClose: () => {
          router.push('/');
        } });
    } else {
      setAvatarImg(GetGravatarURL());
    }
  }, [session]);

  useEffect(() => {
    // disable body scroll when navbar is open
    if (paymentModal || successModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  }, [paymentModal, successModal]);

  useEffect(() => {
    if (!router.isReady) return;

    setNft(router.query);
    console.log(`nft-details image: ${nft.image}`);
    setIsLoading(false);
  }, [router.isReady]);

  const [formInput, updateFormInput] = useState({ amount: '', price: '' });

  const checkout = async () => {
    await buyNft(nft, formInput.amount);

    setPaymentModal(false);
    setSuccessModal(true);
  };

  const focusAmount = () => {
    amountRef.current.focus();
  };

  const focusPrice = () => {
    priceRef.current.focus();
  };

  if (isLoading) return <Loader />;

  return (
    <div className="relative flex justify-center md:flex-col min-h-screen">
      <div className="relative flex-1 flexCenter sm:px-4 p-12 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1">
        <div className="relative w-557 minmd:w-2/3 minmd:h-2/3 sm:w-full sm:h-300 h-557 ">
          <Image src={nft.image || images[`nft${nft.i}`]} objectFit="cover" className=" rounded-xl shadow-lg" layout="fill" />
        </div>
      </div>

      <div className="flex-1 justify-start sm:px-4 p-12 sm:pb-4">
        <div className="flex flex-row sm:flex-col">
          <h2 className="font-roboto dark:text-white text-nft-black-1 font-bold text-2xl minlg:text-3xl">{nft.name}</h2>
        </div>

        <div className="mt-3">
          <p className="font-roboto dark:text-white text-nft-black-1 text-xs minlg:text-base font-normal">Creator</p>
          <div className="flex flex-row items-center mt-3">
            <div className="relative w-12 h-12 minlg:w-20 minlg:h-20 mr-2">
              {(currentAccount === nft.seller.toLowerCase() || currentAccount === nft.owner.toLowerCase()) && avatarImg !== ''
                ? <Image loader={() => avatarImg} src={avatarImg} width={200} height={200} objectFit="cover" className="rounded-full" />
                : <Image src={images.creator1} width={200} objectFit="cover" className="rounded-full" />}
            </div>
            <p className="font-roboto dark:text-white text-nft-black-1 text-sm minlg:text-lg font-semibold">
              {shortenAddress((currentAccount === nft.seller.toLowerCase()) ? nft.seller : nft.owner)}
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col">
          <div className="w-full border-b dark:border-nft-black-1 border-nft-gray-1 flex flex-row">
            <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-2xl mb-2">Details</p>
          </div>
          <div className="mt-2">
            <p className="font-roboto dark:text-white text-nft-black-1 font-normal text-base">
              {nft.description}
            </p>
          </div>
          <div className="mt-2">
            <p className="font-roboto dark:text-white text-nft-black-1 font-normal text-base">Listing {nft.amount} minted tokens. </p>
          </div>
          <div className="">
            {(currentAccount !== nft.owner.toLowerCase())
              ? (
                <Input
                  refName={amountRef}
                  inputType="amount"
                  title="Amount of Tokens"
                  placeholder="NFT Amount"
                  handleClick={(e) => updateFormInput({ ...formInput, amount: e.target.value })}
                />
              ) : ''}
            {(currentAccount === nft.owner.toLowerCase())
              ? (
                <Input
                  refName={priceRef}
                  inputType="number"
                  title="Price per Token"
                  placeholder="NFT Price"
                  handleClick={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                />
              ) : ''}
          </div>
        </div>
        <div className="flex flex-row sm:flex-col mt-10">
          {currentAccount === nft.seller.toLowerCase()
            ? (
              <p className="font-roboto dark:text-white text-nft-black-1 font-normal text-base border border-gray p-2">
                You cannot buy your own NFT
              </p>
            )
            : currentAccount === nft.owner.toLowerCase()
              ? (
                <Button
                  btnName="List on Marketplace"
                  btnType="primary"
                  classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                  handleClick={() => {
                    if (formInput.price <= 0) {
                      alert.error('Invalid price.');
                      focusPrice();
                    } else router.push(`/resell-nft?id=${nft.tokenCreator}&tokenURI=${nft.tokenURI}&amount=${nft.amount}&price=${formInput.price}`);
                  }}
                />
              )
              : (
                <Button
                  btnName={`Buy ${(nft.amount > 1) ? 'each' : ''} for ${nft.price} ${nftCurrency}`}
                  btnType="primary"
                  classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                  handleClick={() => {
                    if (formInput.amount > nft.amount || formInput.amount <= 0) {
                      alert.error('Invalid amount.');
                      focusAmount();
                      return;
                    }
                    setPaymentModal(true);
                  }}
                />
              )}
        </div>
      </div>

      {paymentModal && (
        <Modal
          header="Check Out"
          body={<PaymentBodyCmp nft={nft} nftCurrency={nftCurrency} amount={formInput.amount} />}
          footer={(
            <div className="flex flex-row sm:flex-col">
              <Button
                btnName="Checkout"
                btnType="primary"
                classStyles="mr-5 sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={checkout}
              />
              <Button
                btnName="Cancel"
                btnType="outline"
                classStyles="rounded-lg"
                handleClick={() => setPaymentModal(false)}
              />
            </div>
          )}
          handleClose={() => setPaymentModal(false)}
        />
      )}

      {isLoadingNFT && (
        <Modal
          header="Buying NFT..."
          body={(
            <div className="flexCenter flex-col text-center">
              <div className="relative w-52 h-52">
                <Loader />
              </div>
            </div>
          )}
          handleClose={() => setSuccessModal(false)}
        />
      )}

      {successModal && (
        <Modal
          header="Payment Successful"
          body={(
            <div className="flexCenter flex-col text-center" onClick={() => setSuccessModal(false)}>
              <div className="relative w-52 h-52">
                <Image src={nft.image || images[`nft${nft.i}`]} objectFit="cover" layout="fill" />
              </div>
              <p className="font-roboto dark:text-white text-nft-black-1 text-sm minlg:text-xl font-normal mt-10"> You successfully purchased <span className="font-semibold">{nft.name}</span> from <span className="font-semibold">{shortenAddress(nft.seller)}</span>.</p>
            </div>
          )}
          footer={(
            <div className="flexCenter flex-col">
              <Button
                btnName="Check it out"
                btnType="primary"
                classStyles="sm:mr-0 sm:mb-5 rounded-xl"
                handleClick={() => router.push('/my-nfts')}
              />
            </div>
          )}
          handleClose={() => setSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default AssetDetails;
