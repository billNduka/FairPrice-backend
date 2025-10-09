import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class ProductsService {
    async searchProducts(query:string = "Tecno Camon 40"){
        let results: { title: string | undefined; price: string; link: string }[] = [];
        let page = 1;
        const maxPages = 3;
        const baseUrl = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;
        

        try{
            while (page <= maxPages){   
                const url = `${baseUrl}&page=${page++}`;
                console.log(`Scraping page ${page}: ${url}`);

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

            const averagePrice = Math.round(results.map(r => parseInt(r.price.replace(/\D/g, ""))).reduce((sum, val) => sum + val, 0) / results.length);
            const filteredResults = results.filter(r => {
                const numericPrice = parseInt(r.price.replace(/\D/g, ""));
                return numericPrice >= averagePrice * 0.7 && numericPrice <= averagePrice * 5;
            });

            return {
                    query,
                    count: filteredResults.length,
                    lowestPrice: filteredResults.length ? Math.min(...filteredResults.map(r => parseInt(r.price.replace(/\D/g, "")))) : null,
                    highestPrice: filteredResults.length ? Math.max(...filteredResults.map(r => parseInt(r.price.replace(/\D/g, "")))) : null,
                    averagePrice: averagePrice,
                    filteredResults
            };
            
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}

