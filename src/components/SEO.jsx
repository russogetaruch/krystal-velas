import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image, url }) {
  const siteTitle = "Krystal Velas | Artesanato e Fé em Ibiporã";
  const fullTitle = title ? `${title} | Krystal Velas` : siteTitle;
  const siteDescription = description || "Desde Ibiporã para todo o Brasil. Velas artesanais de parafina pura, artigos religiosos e decorativos com qualidade industrial e carinho artesanal.";
  const siteImage = image || "https://krystalvelas.vittalix.com.br/logo.png";
  const siteUrl = url || "https://krystalvelas.vittalix.com.br";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={siteDescription} />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />

      {/* Primary Color */}
      <meta name="theme-color" content="#2d1407" />
    </Helmet>
  );
}
