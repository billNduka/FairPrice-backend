import { Injectable } from '@nestjs/common';
import { BaseScraperService, ScrapedProduct } from './baseScraper.service';
import * as cheerio from 'cheerio';

@Injectable()
export class KongaService extends BaseScraperService {
  protected source = 'konga';
  protected maxPages = 2;

  protected mapSortOption(sort: string): string {
    switch (sort) {
      case 'Price: Ascending':
        return 'asc';
      case 'Price: Descending':
        return 'desc';
      case 'Newest':
        return '';
      case 'Rating':
        return '';
      case 'Popularity':
      default:
        return 'popularity';
    }
  }

  protected buildUrl(query: string, sortType: string, page: number): string {
    const sortParam = sortType ? `&sortBy=${encodeURIComponent(sortType)}` : '';
    return `https://www.konga.com/search?search=${encodeURIComponent(query)}&open_sort=yes${sortParam}&page=${page}`;
  }

  protected parseResults($: cheerio.CheerioAPI, results: ScrapedProduct[]): void {
    try {
      // First try: read Next.js embedded JSON from __NEXT_DATA__ and extract products
      const nextDataScript = $('script#__NEXT_DATA__').html();
      if (nextDataScript) {
        try {
          const nd = JSON.parse(nextDataScript);
          // Recursively search for an array of product-like objects
          const findProducts = (obj: any): any[] | null => {
            if (!obj || typeof obj !== 'object') return null;
            if (Array.isArray(obj)) {
              // heuristic: look for array where elements have name/title and price/url
              const candidate = obj.filter((it: any) => it && (it.title || it.name || it.product_name || it.displayName) && (it.price || it.finalPrice || it.minPrice || it.selling_price || it.price_info));
              if (candidate && candidate.length) return candidate;
            }
            for (const k of Object.keys(obj)) {
              try {
                const res = findProducts(obj[k]);
                if (res && res.length) return res;
              } catch (e) {
                /* ignore */
              }
            }
            return null;
          };

          const productsArray = findProducts(nd);
          if (productsArray && productsArray.length) {
            productsArray.forEach((p: any) => {
              const title = p.title || p.name || p.product_name || p.displayName || '';
              // price may be object or number
              let price = '';
              if (p.price && typeof p.price === 'string') price = p.price;
              else if (p.price && typeof p.price === 'number') price = `₦ ${p.price.toLocaleString()}`;
              else if (p.finalPrice && typeof p.finalPrice === 'number') price = `₦ ${p.finalPrice.toLocaleString()}`;
              else if (p.price_info && p.price_info.amount) price = `₦ ${Number(p.price_info.amount).toLocaleString()}`;

              const href = p.url || p.productUrl || p.product_detail_url || p.link || p.path || '';
              const link = href ? (href.startsWith('http') ? href : `https://www.konga.com${href}`) : '';
              const image = (p.image && (p.image.src || p.image.url)) || p.image || p.thumbnail || '';

              if (title && price && link) {
                results.push({ source: this.source, title: title.toString(), price: price.toString(), link: link.toString(), image: image.toString() });
              }
            });
            return; // done parsing
          }
        } catch (e) {
          // fall through to DOM parsing
        }
      }

      // Fallback: traditional DOM scraping for server-rendered HTML
      $('div.ListingCard_listingCardMetaContainer__HCXHt').each((_, el) => {
        const title = $(el).find('.ListingCard_productTitle_9Kzxv').text().trim();
        const price = $(el).find('.shared_price__gnso_').text().trim();
        const href = $(el).find('a').attr('href') || '';
        const link = href
          ? href.startsWith('http')
            ? href
            : `https://www.konga.com.ng${href}`
          : '';
        const image =
          $(el).find('img').attr('data-src') ||
          $(el).find('img').attr('src') ||
          '';

        if (title && price && link) {
          results.push({
            source: this.source,
            title,
            price,
            link,
            image: image.toString(),
          });
        }
      });
    } catch (error: any) {
      console.error('Error parsing Konga results:', error);
    }
  }
}
