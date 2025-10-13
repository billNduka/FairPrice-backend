import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class JumiaService {
    async searchJumia(query: string){
        let results: { title: string | undefined; price: string; link: string }[] = [];
        let page = 1;
        const maxPages = 3;
        const baseUrl = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;
        
        try{
            while (page <= maxPages){   
                const url = `${baseUrl}&page=${page++}`;
                console.log(`Scraping jumia page ${page}: ${url}`);

                const { data } = await axios.get(url);  
                const $ = cheerio.load(data);

                $('a.core').each((i, el) => {
                    const title = $(el).find('.name').text();
                    const price = $(el).find('.prc').text();
                    const link = "https://www.jumia.com.ng" + $(el).attr('href');

                    if (title && price && link) {
                        results.push({ title, price, link });
                    }
                });
            }

            return {
                source: 'jumia',
                results
            };
            
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}