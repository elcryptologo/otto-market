import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

import { TMDBContext } from '../context/TMDBService';
import { Banner, Loader } from '../components';

const LoginNFTs = () => {
  const router = useRouter();
  const [isLoading] = useState(false);
  const { session, HasSession } = useContext(TMDBContext);

  useEffect(() => {
    if (session !== '' && HasSession()) {
      router.push('/my-nfts');
    } else {
      router.push('/');
    }
  }, [session, HasSession]);

  if (isLoading) {
    return (
      <div className="flexStart min-h-screen">
        <Loader />
      </div>
    );
  }
  return (
    <div>
      <Banner name="login" />
    </div>
  );
};
export default LoginNFTs;
