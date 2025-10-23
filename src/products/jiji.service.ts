import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class JijiService {
    async searchJiji(query: string){
        let results: { source: "jiji", title: string | undefined; price: string; link: string }[] = [];
        let page = 1;
        const maxPages = 3;
        const baseUrl = `https://jiji.ng/search?query=${encodeURIComponent(query)}`;
        
        try{
            while (page <= maxPages){   
                const url = `${baseUrl}&page=${page++}`;
                console.log(`Scraping jiji page ${page}: ${url}`);

                const { data } = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    },
                    timeout: 15000
                });  
                const $ = cheerio.load(data);

                const items = $('a').filter((_, el) => {
                    const hasTitle = $(el).find('.qa-advert-list-item-title').length > 0;
                    const hasPrice = $(el).find('.qa-advert-price').length > 0;
                    return hasTitle || hasPrice;
                });

                items.each((i, el) => {
                    const title = $(el).find('.qa-advert-list-item-title').text().trim();
                    const price = $(el).find('.qa-advert-price').text().trim();
                    const href = $(el).attr('href') || '';
                    const link = href ? (href.startsWith('http') ? href : new URL(href, 'https://jiji.ng').href) : '';

                    if (title && price && link) {
                        results.push({ source: "jiji", title, price, link });
                    }
                });

                page++;
            }

            return {
                results
            };
            
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}