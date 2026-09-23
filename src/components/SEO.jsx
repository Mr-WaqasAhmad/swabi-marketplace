import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://swabimarket.com'; // Apna domain yahan daalein
const SITE_NAME = 'Swabi Market';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`; // Public folder mein og-image.jpg rakhein

export const SEO = ({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  url = '',
  type = 'website',
  author = 'Waqas Ahmad',
  publishedTime,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Buy & Sell in Swabi`;
  const fullUrl = `${SITE_URL}${url}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_PK" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional */}
      <meta name="theme-color" content="#0a4d3c" />
      <meta name="geo.region" content="PK-KP" />
      <meta name="geo.placename" content="Swabi" />
    </Helmet>
  );
};