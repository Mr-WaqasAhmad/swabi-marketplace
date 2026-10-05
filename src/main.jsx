import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { lazy, Suspense } from 'react'
import { App } from './App.jsx'
import { ErrorPage } from './components/ErrorPage.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { PublicOnlyRoute } from './components/PublicOnlyRoute.jsx'
import { UserDetailsProvider } from './contexts/UserDetailsContext'
import './index.css'

// ✅ LAZY LOADED COMPONENTS
const AboutUs = lazy(() => import('./components/AboutUs.jsx').then(m => ({ default: m.AboutUs })))
const Home = lazy(() => import('./components/Home.jsx').then(m => ({ default: m.Home })))
const Login = lazy(() => import('./components/Login.jsx').then(m => ({ default: m.Login })))
const PostAd = lazy(() => import('./components/PostAd.jsx').then(m => ({ default: m.PostAd })))
const Privacy = lazy(() => import('./components/Privacy.jsx').then(m => ({ default: m.Privacy })))
const Signup = lazy(() => import('./components/Signup.jsx').then(m => ({ default: m.Signup })))
const SingleProductDetails = lazy(() => import('./components/SingleProductDetails.jsx').then(m => ({ default: m.SingleProductDetails })))
const Terms = lazy(() => import('./components/Terms.jsx').then(m => ({ default: m.Terms })))
const UserPost = lazy(() => import('./components/UserPost.jsx').then(m => ({ default: m.UserPost })))
const UserProfile = lazy(() => import('./components/UserProfile.jsx').then(m => ({ default: m.UserProfile })))
const SellerProfile = lazy(() => import('./components/SellerProfile.jsx').then(m => ({ default: m.SellerProfile })))
const Chat = lazy(() => import('./components/Chat.jsx').then(m => ({ default: m.Chat })))
const Messages = lazy(() => import('./components/Messages.jsx').then(m => ({ default: m.Messages })))  // ✅ NAYA

// ✅ LOADING COMPONENT
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-16 h-16 border-4 border-[#0a4d3c] border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-sm font-semibold text-[#0a4d3c]">Loading...</p>
  </div>
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "terms",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Terms />
          </Suspense>
        )
      },
      {
        path: "privacy",
        element: (
          <Suspense fallback={<PageLoader />}>
            <Privacy />
          </Suspense>
        )
      },
      {
        path: "aboutus",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AboutUs />
          </Suspense>
        )
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            )
          },
          {
            path: "login",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Login />
              </Suspense>
            )
          },
          {
            path: "signup",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Signup />
              </Suspense>
            )
          },
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "home",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Home />
              </Suspense>
            )
          },
          {
            path: "userpost",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserPost />
              </Suspense>
            )
          },
          {
            path: "userprofile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserProfile />
              </Suspense>
            )
          },
          {
            path: "postad",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PostAd />
              </Suspense>
            )
          },
          {
            path: "postad/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PostAd />
              </Suspense>
            )
          },
          {
            path: "singleproductdetails/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SingleProductDetails />
              </Suspense>
            )
          },
          {
            path: "seller/:sellerId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SellerProfile />
              </Suspense>
            )
          },
          // ✅ MESSAGES ROUTE (NAYA)
          {
            path: "messages",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Messages />
              </Suspense>
            )
          },
          // ✅ CHAT ROUTE
          {
            path: "chat/:postId/:sellerId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Chat />
              </Suspense>
            )
          },
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <UserDetailsProvider>
        <RouterProvider router={router} />
      </UserDetailsProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
