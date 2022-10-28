import { useContext } from 'react';

import { NFTContext } from '../context/NFTContext';

const Input = ({ inputType, title, placeholder, handleClick, refName }) => {
  const { nftCurrency } = useContext(NFTContext);

  return (
    <div className="mt-10 w-full">
      <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-lg">{title}</p>

      {inputType === 'number' ? (
        <div className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-roboto dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3 flexBetween flex-row">
          <input
            ref={refName}
            type="number"
            className="flex-1 w-full dark:bg-nft-black-1 bg-white outline-none "
            placeholder={placeholder}
            onChange={handleClick}
          />
          <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-lg">{nftCurrency}</p>
        </div>
      )
        : inputType === 'royalties' ? (
          <div className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-roboto dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3 flexBetween flex-row">
            <input
              ref={refName}
              type="number"
              className="flex-1 w-full dark:bg-nft-black-1 bg-white outline-none "
              placeholder={placeholder}
              onChange={handleClick}
            />
            <p className="font-roboto dark:text-white text-nft-black-1 font-semibold text-lg">%</p>
          </div>
        )
          : inputType === 'amount' ? (
            <div className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-roboto dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3 flexBetween flex-row">
              <input
                ref={refName}
                type="number"
                className="flex-1 w-full dark:bg-nft-black-1 bg-white outline-none "
                placeholder={placeholder}
                onChange={handleClick}
              />
            </div>
          )
            : inputType === 'textarea' ? (
              <textarea
                ref={refName}
                rows={10}
                className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-roboto dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3"
                placeholder={placeholder}
                onChange={handleClick}
              />
            )
              : (
                <input
                  ref={refName}
                  className="dark:bg-nft-black-1 bg-white border dark:border-nft-black-1 border-nft-gray-2 rounded-lg w-full outline-none font-roboto dark:text-white text-nft-gray-2 text-base mt-4 px-4 py-3"
                  placeholder={placeholder}
                  onChange={handleClick}
                />
              )}
    </div>
  );
};

export default Input;
