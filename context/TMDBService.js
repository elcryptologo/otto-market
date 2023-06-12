/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export const TMDBContext = React.createContext();

export const TMDBProvider = ({ children }) => {
  const [expiration, setExpiration] = useState(new Date());
  const [requestToken, setRequestToken] = useState('');
  const [session, setSession] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [gravatar, setGravatar] = useState('');
  const router = useRouter();
  let _session = '';

  const GetToken = async () => {
    try {
      if (requestToken !== '') return [];
      const response = await fetch(`${process.env.tmdbApiHost}/3/authentication/token/new?api_key=${process.env.tmdbKey}`);
      const result = await response.json();
      const items = [result].map((tmdb) => {
        if (!tmdb.success || typeof window === 'undefined') {
          alert(`Error in GetToken: ${tmdb.status_message}`);
          return [];
        }
        const adate = new Date(Date.parse(tmdb.expires_at));
        setExpiration(adate);
        setRequestToken(tmdb.request_token);
        window.sessionStorage.setItem('expiration', adate);
        window.sessionStorage.setItem('hasSession', false);
        return [{ expiration, requestToken }];
      });
      return items;
    } catch (error) {
      alert(error);
      return [];
    }
  };

  const GetSessionURL = () => {
    if (requestToken === '') return '';
    const { origin } = new URL(window.location.href);
    return (`${process.env.tmdbHost}/authenticate/${requestToken}?redirect_to=${origin}/login-nfts`);
  };

  const HasSession = async () => {
    if (typeof window === 'undefined' || window.sessionStorage.getItem('expiration') === 'undefined' || window.sessionStorage.getItem('expiration') < Date.now()) return [];
  };

  const GetSession = async (token) => {
    try {
      if (!HasSession()) return [];
      const response = await fetch(`${process.env.tmdbApiHost}/3/authentication/session/new?api_key=${process.env.tmdbKey}&request_token=${token}`);
      const result = await response.json();
      setSession([result].map((tmdb) => {
        if (!tmdb.success) {
          alert(`Error in GetSession: ${tmdb.status_message}`);
          return '';
        }
        _session = tmdb.session_id;
        return tmdb.session_id;
      }));
      window.sessionStorage.setItem('hasSession', true);
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
    } catch (error) {
      alert(error);
      return '';
    }
  };
  const GetAccountDetails = async () => {
    try {
      if (session === '' && _session === '') return;
      if (session !== '' && _session === '') _session = session;
      const response = await fetch(`${process.env.tmdbApiHost}/3/account?api_key=${process.env.tmdbKey}&session_id=${_session}`);
      const result = await response.json();
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
    return (`https://www.gravatar.com/avatar/${gravatar}?s=200`);
  };

  useEffect(async () => {
    if (!router.isReady) return;
    if (router.query.request_token !== undefined) {
      setRequestToken(router.query.request_token);
      await GetSession(router.query.request_token);
      await GetAccountDetails();
    } else {
      GetToken();
    }
  }, [router.isReady]);

  return (
    <TMDBContext.Provider value={{ name, userName, session, HasSession, GetGravatarURL, GetSessionURL, DeleteSession }}>
      {children}
    </TMDBContext.Provider>
  );
};

