import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async' // ✅ ADD
import { App } from './App.jsx'
import { AboutUs } from './components/AboutUs.jsx'
import { ErrorPage } from './components/ErrorPage.jsx'
import { Home } from './components/Home.jsx'
import { Login } from './components/Login.jsx'
import { PostAd } from './components/PostAd.jsx'
import { Privacy } from './components/Privacy.jsx'
import { Signup } from './components/Signup.jsx'
import { SingleProductDetails } from './components/SingleProductDetails.jsx'
import { SellerProfile } from './components/SellerProfile.jsx'
import { Terms } from './components/Terms.jsx'
import { UserPost } from './components/UserPost.jsx'
import { UserProfile } from './components/UserProfile.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { PublicOnlyRoute } from './components/PublicOnlyRoute.jsx'
import './index.css'
import { Footer } from './components/Footer.jsx'
import { UserDetailsProvider } from './contexts/UserDetailsContext';

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
        element: <Terms />
      },
      {
        path: "privacy",
        element: <Privacy />
      },
      {
        path: "aboutus",
        element: <AboutUs />
      },
      {
        path: "footer",
        element: <Footer />
      },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            index: true,
            element: <Login />
          },
          {
            path: "login",
            element: <Login />
          },
          {
            path: "signup",
            element: <Signup />
          },
        ]
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "home",
            element: <Home />
          },
          {
            path: "userpost",
            element: <UserPost />
          },
          {
            path: "userprofile",
            element: <UserProfile />
          },
          {
            path: "postad",
            element: <PostAd />
          },
          {
           path: "postad/:id",
           element: <PostAd />
           },
          {
            path: "singleproductdetails/:id",
            element: <SingleProductDetails />
          },
          {
            path: "seller/:sellerId",
            element: <SellerProfile />
          },
        ]
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <HelmetProvider>                              {/* ✅ ADD */}
    <QueryClientProvider client={queryClient}>
      <UserDetailsProvider>
        <RouterProvider router={router} />
      </UserDetailsProvider>
    </QueryClientProvider>
  </HelmetProvider>
);
