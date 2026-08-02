import { Injectable } from '@nestjs/common';
import { BaseScraperService, ScrapedProduct } from './baseScraper.service';
import axios from "axios";
import * as cheerio from "cheerio";

// @Injectable()
// export class JumiaService {
//     async searchJumia(query: string, sort){
//         let results: { source: "jumia"; title: string; price: string; link: string; image:string }[] = [];
//         let page = 1;
//         let sortType = "";
//         const maxPages = 1;

//         const jumiaSortOptions: { [key: string]: string } = {
//             Popularity: "popularity",
//             NewestArrivals: "newest",
//             ProductRating: "rating",
//             PriceAscending: "lowest-price",
//             PriceDescending: "highest-price"
//         }

//         
        

//         const baseUrl = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}&sort=${encodeURIComponent(sortType)}`;
        
//         try{
//             while (page <= maxPages){   
//                 const url = `${baseUrl}&page=${page}`;
//                 console.log(`Scraping jumia page ${page++}: ${url}`);

//                 const { data } = await axios.get(url, {
//                     headers: {
//                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//                         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//                         'Accept-Language': 'en-US,en;q=0.5',
//                         'Accept-Encoding': 'gzip, deflate, br',
//                         'Connection': 'keep-alive',
//                         'Upgrade-Insecure-Requests': '1',
//                         'Sec-Fetch-Dest': 'document',
//                         'Sec-Fetch-Mode': 'navigate',
//                         'Sec-Fetch-Site': 'none',
//                         'Cache-Control': 'max-age=0'
//                     },
//                     timeout: 30000
//                 });  
//                 const $ = cheerio.load(data);
//                 console.log(`Jumia page ${page}: Found ${$('a').length} total links`);

//                 $('a').each((i, el) => {
//                     const link = $(el).attr('href');
//                     if (!link || (!link.includes('jumia.com.ng') && !link.startsWith('/')) || !link.includes('.html')) return;

//                     const text = $(el).text();
//                     if (!text || !text.includes('₦')) return;

//                     const titleEl = $(el).find('.name').text();
//                     const title = titleEl || (text ? text.split('₦')[0].trim() : '');
//                     const priceEl = $(el).find('.prc').text();
//                     const priceMatch = text?.match(/₦[\d,]+/);
//                     const price = priceEl || (priceMatch ? priceMatch[0] : '');
//                     const imgEl = $(el).find('img');
//                     const image = (imgEl.attr('data-src') || imgEl.attr('src') || '').toString();

//                     if (title && price && link) {
//                         results.push({ source: "jumia", title, price, link: link.startsWith('http') ? link : "https://www.jumia.com.ng" + link, image });
//                     }
//                 });
//             }

//             return {
//                 results
//             };
            
//         }catch(error: any){
//             console.error("Error scraping Jumia: ", query, error);
//             return { results: [] };
//         }
//     }
// }
@Injectable()
export class JumiaService extends BaseScraperService {
    protected source = "jumia";
    protected maxPages = 1;

    protected mapSortOption(sort: string): string {
        switch (sort) {
            case "Rating":
                return "rating";
            case "Newest":
                return "newest";
            case "Price: Ascending":
                return "lowest-price";
            case "Price: Descending":
                return "highest-price";
            case "Popularity":
            default:
                return "popularity";
        }
    }

    protected buildUrl(query: string, sortType: string, page: number): string {
        return `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}&sort=${encodeURIComponent(sortType)}&page=${page}`;
    }

    protected parseResults($: cheerio.CheerioAPI, results: ScrapedProduct[]): void {
        try {
            $('a').each((i, el) => {
                const link = $(el).attr('href');
                if (!link || (!link.includes('jumia.com.ng') && !link.startsWith('/')) || !link.includes('.html')) return;

                const text = $(el).text();
                if (!text || !text.includes('₦')) return;

                const titleEl = $(el).find('.name').text();
                const title = titleEl || (text ? text.split('₦')[0].trim() : '');
                const priceEl = $(el).find('.prc').text();
                const priceMatch = text?.match(/₦[\d,]+/);
                const price = priceEl || (priceMatch ? priceMatch[0] : '');
                const imgEl = $(el).find('img');
                const image = (imgEl.attr('data-src') || imgEl.attr('src') || '').toString();

                if (title && price && link) {
                    results.push({
                        source: this.source,
                        title,
                        price,
                        link: link.startsWith('http') ? link : "https://www.jumia.com.ng" + link,
                        image
                    });
                }
            });
        } catch (error: any) {
            console.error('Error parsing Jumia results:', error);
        }
    }
}