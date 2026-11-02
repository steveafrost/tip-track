import type { MetadataRoute } from "next";

const siteUrl = "https://usetiptrack.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/delivery-tip-tracker`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog/how-to-track-delivery-tips-on-iphone`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/how-to-track-delayed-delivery-tips-on-iphone`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/delivery-order-history-without-spreadsheet`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/blog/how-to-remember-repeat-delivery-addresses`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/press`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
