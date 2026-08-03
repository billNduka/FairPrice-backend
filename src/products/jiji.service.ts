import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";
import { BaseScraperService, ScrapedProduct } from './baseScraper.service';

@Injectable()
export class JijiScraperService extends BaseScraperService{
    protected source = "jiji";
    protected maxPages = 1;

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