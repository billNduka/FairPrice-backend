import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class KongaService {
     async searchKonga(query: string){
        let results: { title: string | undefined; price: string; link: string }[] = [];
        let page = 1;
        const maxPages = 3;
        const baseUrl = `https://www.konga.com/search?search=${encodeURIComponent(query)}`;
        
        try{
            while (page <= maxPages){   
                const url = `${baseUrl}&page=${page}`;
                console.log(`Scraping konga page ${page}: ${url}`);

                const { data } = await axios.get(url);  
                const $ = cheerio.load(data);

                console.log($('div.ListingCard_listingCardMetaContainer__HCXHt'))
                $('div.ListingCard_listingCardMetaContainer__HCXHt').each((i, el) => {
                    const title = $(el).find('.ListingCard_productTitle_9Kzxv').text();
                    const price = $(el).find('.shared_price__gnso_').text();
                    const link = "https://www.konga.com.ng" + $(el).find("a").attr('href');

                    console.log({ title, price, link })
                    if (title && price && link) {
                        results.push({ title, price, link });   
                    }
                });

                page++;
            }
            console.log(results)
            return {
                source: 'konga',
                results
            };
            
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}