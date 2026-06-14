import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";
import { BaseScraperService, ScrapedProduct } from './baseScraper.service';

// @Injectable()
// export class JijiService {
//     async searchJiji(query: string, sort:string){
//         let results: { source: "jiji", title: string | undefined; price: string; link: string; image:string }[] = [];

//         let page = 1;
//         let sortType = "";
//         const maxPages = 1;
        
//         const jijiSortOptions: { [key: string]: string } = {
//             Popularity: "rel",
//             NewestArrivals: "new",
//             ProductRating: "rating",
//             PriceAscending: "price",
//             PriceDescending: "price_desc"
//         }
        
//             switch (sort) {
//             case "Newest":
//                 sortType = jijiSortOptions.NewestArrivals;
//                 break;

//             case "Price: Ascending":
//                 sortType = jijiSortOptions.PriceAscending;
//                 break;

//             case "Price: Descending":
//                 sortType = jijiSortOptions.PriceDescending;
//                 break;

//             case "Rating":
//                 sortType = jijiSortOptions.ProductRating;
//                 break;
                
//             case "Popularity":
//             default:
//                 sortType = jijiSortOptions.Popularity;
//                 break;
                
//         }

//         const baseUrl = `https://jiji.ng/search?query=${encodeURIComponent(query)}&sort=${encodeURIComponent(sortType)}`;
        
//         try{
//             while (page <= maxPages){   
//                 const url = `${baseUrl}&page=${page}`;
//                 console.log(`Scraping jiji page ${page++}: ${url}`);

//                 const { data } = await axios.get(url, {
//                     headers: {
//                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//                         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
//                     },
//                     timeout: 15000
//                 });  
//                 const $ = cheerio.load(data);
//                 const items = $('a').filter((_, el) => {
//                     const hasTitle = $(el).find('.qa-advert-list-item-title').length > 0;
//                     const hasPrice = $(el).find('.qa-advert-price').length > 0;
//                     return hasTitle || hasPrice;
//                 });
//                 console.log(`Jiji page ${page}: Found ${items.length} product links`);

//                 items.each((i, el) => {
//                     const title = $(el).find('.qa-advert-list-item-title').text().trim();
//                     const price = $(el).find('.qa-advert-price').text().trim();
//                     const href = $(el).attr('href') || '';
//                     const image = $(el).find('img').attr('src') || '';
//                     const link = href ? (href.startsWith('http') ? href : new URL(href, 'https://jiji.ng').href) : '';

//                     if (title && price && link) {
//                         results.push({ source: "jiji", title, price, link, image });
//                     }
//                 });

//                 page++;
//             }

//             return {
//                 results
//             };
            
//         }catch(error: any){
//             console.error("Error scraping Jiji: ", query, error);
//             return { results: [] };
//         }
//     }
// }

@Injectable()
export class JijiService extends BaseScraperService{
    protected source = "jiji";
    protected maxPages = 3;

    protected mapSortOption(sort: string): string {
                switch (sort) {
            case "Rating":
                return "rating";
            case "Newest":
                return "new"
            case "Price: Ascending":
                return "price"
            case "Price: Descending":
                return "price_desc";
            case "Popularity":
            default:
                return "rel";
        }
    }

    protected buildUrl(query: string, sortType: string, page: number): string {
        return `https://jiji.ng/search?query=${encodeURIComponent(query)}&sort=${encodeURIComponent(sortType)}&page=${page}`;
    }

    protected parseResults($: cheerio.CheerioAPI, results: ScrapedProduct[]): void {
        try{
            const items = $('a').filter((_, el) => {
                const hasTitle = $(el).find('.qa-advert-list-item-title').length > 0;
                const hasPrice = $(el).find('.qa-advert-price').length > 0;
                return hasTitle || hasPrice;
            });

            items.each((i, el) => {
                const title = $(el).find('.qa-advert-list-item-title').text().trim();
                const price = $(el).find('.qa-advert-price').text().trim();
                const href = $(el).attr('href') || '';
                const image = $(el).find('img').attr('src') || '';
                const link = href ? (href.startsWith('http') ? href : new URL(href, 'https://jiji.ng').href) : '';

                if (title && price && link) {
                    results.push({
                        source: this.source,
                        title,
                        price,
                        link,
                        image
                    });
                }
            });
        }catch(error: any){
            console.error("Error parsing Jiji results: ", error);
        }
    }
}