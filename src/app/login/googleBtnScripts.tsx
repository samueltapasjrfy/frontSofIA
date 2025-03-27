"use client"
import Script from 'next/script';
import { useNonce } from './layout';

export default function GoogleBtnScripts() {
  const nonce = useNonce()

  return (
    <>
      {/* Script da função onSignIn */}
      <Script nonce={nonce} id="google-signin-script" strategy="lazyOnload">
        {`
            function onSignIn(googleUser) {
              var profile = googleUser.getBasicProfile();
              console.log('ID: ' + profile.getId());
              console.log('Name: ' + profile.getName());
              console.log('Image URL: ' + profile.getImageUrl());
              console.log('Email: ' + profile.getEmail());
              }
              `}
      </Script>
      <Script nonce={nonce}>
        {`
          function onSuccess(googleUser) {
            console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
            }
            function onFailure(error) {
              console.log(error);
              }
              function renderButton() {
            gapi.signin2.render('google-signin2', {
              'scope': 'profile email',
              'width': 180,
              'height': 40,
              'longtitle': true,
              'theme': 'dark',
              'onsuccess': onSuccess,
              'onfailure': onFailure
              });
              }
              `}
      </Script>
      {/* Script do Google Sign-In */}
      <Script nonce={nonce} src="https://apis.google.com/js/platform.js?onload=renderButton" strategy="lazyOnload" />
      <Script nonce={nonce}>
        {`
          console.log('Btn google script 0.0.1')
          let tryCount = 0;
          const showBtnGoogle = () => {
          }
          const changeBtnGoogleStyle = () => {
            tryCount++;
            if (tryCount >= 10) clearInterval(interval);
            if (!document.querySelector('.abcRioButton')) return;
            document.querySelector('.abcRioButton').className='btn-google'
            document.querySelector('.abcRioButtonContents').innerHTML = ''
            document.querySelector('.box-btn-google').style.display = 'flex'
            document.querySelector('.box-btn-google-loader').style.display = 'none'
            clearInterval(interval);
            clearTimeout(timeoutRemoveLoader);
          }
          const interval = setInterval(() => {
            changeBtnGoogleStyle();
          }, 1000);
          const timeoutRemoveLoader = setTimeout(() => {
            document.querySelector('.box-btn-google-loader').style.display = 'none'
          }, 10000)
        `}
      </Script>
    </>
  );
}
