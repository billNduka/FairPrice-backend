import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class ProductsService {
    async searchProducts(query:string = "Tecno Camon 40"){
        let results: { title: string | undefined; price: string; link: string }[] = [];
        const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;

        try{
            const { data } = await axios.get(url);  
            const $ = cheerio.load(data);

            $('a.core').each((i, el) => {
                const title = $(el).find('.name').text();
                const price = $(el).find('.prc').text();
                const link = "https://www.jumia.com.ng" + $(el).attr('href');

                if (title && price) {
                    results.push({ title, price, link });
                }

            });

            return {
                    query,
                    count: results.length,
                    lowestPrice: results.length ? Math.min(...results.map(r => parseInt(r.price.replace(/\D/g, "")))) : null,
                    highestPrice: results.length ? Math.max(...results.map(r => parseInt(r.price.replace(/\D/g, "")))) : null,
                    results
            };
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}

