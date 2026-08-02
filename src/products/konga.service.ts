import { Injectable } from '@nestjs/common';
import { BaseScraperService, ScrapedProduct } from './baseScraper.service';
import * as cheerio from 'cheerio';

@Injectable()
export class KongaService extends BaseScraperService {
  protected source = 'konga';
  protected maxPages = 1;

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
  console.log("parsing konga results...")
  try {
      const JSONContainer:any = $('script[type="application/ld+json"]').filter((_, el) => {
        const text = $(el).html() || "";
        
        return text.includes("#results");
      })

      const scriptContent = JSONContainer.html();

      let json = JSON.parse(scriptContent);
      let items = json["@graph"][2].itemListElement;
     
      for (const listItem of items) {
        const product = listItem.item;

        const title = product.name;
        const price = product.offers?.price.toString();
        const link = product.url;
        const image = product.image;

        if (title && price && link) {
            results.push({
                source: this.source,
                title,
                price,
                link,
                image,
            });
        }
    }

    }catch (error: any) {
      console.error("Konga parse failed:", error);
    }
  }
}
