import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { ScrollToTop } from './components/ScrollToTop';

export const App = () => {
  const location = useLocation();

  // ✅ Chat page pe Footer hide
  const isChatPage = location.pathname.startsWith('/chat');
  // ✅ Messages page pe bhi Footer hide
  const isMessagesPage = location.pathname.startsWith('/messages');

  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      {/* ✅ Chat aur Messages page pe Footer hide */}
      {!isChatPage && !isMessagesPage && <Footer />}
    </>
  )
}
