import axiosClient from '@/app/axiosClient'
import { store } from '@/redux/store'
import '@/styles/globals.scss'
import 'react-toastify/dist/ReactToastify.css';
import type { AppProps } from 'next/app'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Provider } from 'react-redux'
import {ToastContainer } from 'react-toastify'
import Loader from '@/components/elements/loader/Loader';
import { useSelector } from 'react-redux';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted,setMounted] = useState(false);
  

  useEffect(()=>{setMounted(true)},[])
  return (
    mounted&&(<Provider store={store}>
      <ToastContainer position='top-right'/>      
      <Component {...pageProps} />
    </Provider>)
  )
}
