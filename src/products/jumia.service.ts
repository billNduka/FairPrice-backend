import { Injectable } from '@nestjs/common';
import { BaseScraperService, ScrapedProduct } from './baseScraper.service';
import axios from "axios";
import * as cheerio from "cheerio";

@Injectable()
export class JumiaScraperService extends BaseScraperService {
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