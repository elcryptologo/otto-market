/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const TMDBContext = React.createContext();

export const TMDBProvider = ({ children }) => {
  const [expires, setExpiration] = useState(new Date());
  const [requestToken, setRequestToken] = useState('');
  const [session, setSession] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [gravatar, setGravatar] = useState('');
  const router = useRouter();
  let _session = '';

  const GetToken = async () => {
    try {
      if (requestToken !== '' || expires.setHours(1) < Date.now) return [];
      const response = await fetch('https://api.themoviedb.org/3/authentication/token/new?api_key=b204a0381ec6e87c4459f4b9ad7759d2');
      const result = await response.json();
      const items = [result].map((tmdb) => {
        if (!tmdb.success) {
          console.log(`Error in GetToken: ${tmdb.status_message}`);
          return [];
        }
        setExpiration(tmdb.expires_at);
        setRequestToken(tmdb.request_token);
        window.sessionStorage.setItem('expires', expires);
        window.sessionStorage.setItem('hasSession', false);
        console.log('set token');
        return [{ expires, requestToken }];
      });
      return items;
    } catch (error) {
      alert(error);
      return [];
    }
  };

  const GetSessionURL = () => {
    if (requestToken === '') return '';
    console.log('GetSessionURL');
    return (`https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=http://localhost:3000/login-nfts`);
  };

  const GetSession = async (token) => {
    try {
      if (token === '') return;
      const response = await fetch(`https://api.themoviedb.org/3/authentication/session/new?api_key=b204a0381ec6e87c4459f4b9ad7759d2&request_token=${token}`);
      const result = await response.json();
      setSession([result].map((tmdb) => {
        if (!tmdb.success) {
          console.log(`Error in GetSession: ${tmdb.status_message}`);
          return '';
        }
        _session = tmdb.session_id;
        return tmdb.session_id;
      }));
      window.sessionStorage.setItem('hasSession', true);
      console.log(`in GetSession _session: ${_session}`);
      return _session;
    } catch (error) {
      alert(error);
      return [];
    }
  };

  const DeleteSession = async () => {
    try {
      setSession('');
      setRequestToken('');
      setName('');
      setUserName('');
      setGravatar('');
      _session = '';
      window.sessionStorage.clear();
      window.location.reload();
      // const response = await fetch('https://api.themoviedb.org/3/authentication/session?api_key=b204a0381ec6e87c4459f4b9ad7759d2');
      // const result = await response.json();
      // [result].map((tmdb) => {
      //   if (!tmdb.success) { console.log(`Error in DeleteSession: ${tmdb.status_message}`); }
      //   return '';
      // });
    } catch (error) {
      alert(error);
      return '';
    }
  };
  const GetAccountDetails = async () => {
    try {
      if (session === '' && _session === '') return;
      if (session !== '' && _session === '') _session = session;
      const response = await fetch(`https://api.themoviedb.org/3/account?api_key=b204a0381ec6e87c4459f4b9ad7759d2&session_id=${_session}`);
      const result = await response.json();
      console.log(`results: ${JSON.stringify(result)}`);
      const user = [result].map((tmdb) => {
        setUserName(tmdb.username);
        setName(tmdb.name);
        setGravatar(tmdb.avatar.gravatar.hash);
        return { name, userName };
      });
      return user;
    } catch (error) {
      alert(error);
      return '';
    }
  };

  const GetGravatarURL = () => {
    if (gravatar === '') return;
    console.log(`GetGravatarURL https://www.gravatar.com/avatar/${gravatar}?s=200`);
    return (`https://www.gravatar.com/avatar/${gravatar}?s=200`);
  };

  useEffect(async () => {
    if (!router.isReady) return;
    if (router.query.request_token !== undefined) {
      setRequestToken(router.query.request_token);
      setExpiration(window.sessionStorage.getItem('expires'));
      await GetSession(router.query.request_token);
      await GetAccountDetails();
    } else { GetToken(); }
  }, [router.isReady]);

  return (
    <TMDBContext.Provider value={{ name, userName, session, GetGravatarURL, GetSessionURL, DeleteSession }}>
      {children}
    </TMDBContext.Provider>
  );
};

