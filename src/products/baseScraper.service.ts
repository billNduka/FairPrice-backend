import { Injectable } from '@nestjs/common';
import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedProduct {
    source: string;
    title: string;
    price: string;
    link: string;
    image: string;
}

@Injectable()
export abstract class BaseScraperService {
    protected abstract source: string;
    protected abstract maxPages: number;
    protected genericSortOptions:string[] = ["Popularity", "Newest", "Price: Ascending", "Price: Descending", "Rating"];

    protected abstract buildUrl(query: string, sortType: string, page: number): string;
    
    protected abstract mapSortOption(sort: string): string;

    protected abstract parseResults($: cheerio.CheerioAPI, results: ScrapedProduct[]): void;

    async search(query: string, sort: string): Promise<{ results: ScrapedProduct[] }> {
        const results: ScrapedProduct[] = [];
        const sortType = this.mapSortOption(sort);
        let page = 1;

        try {
            while (page <= this.maxPages) {
                const url = this.buildUrl(query, sortType, page);
                console.log(`Scraping ${this.source} page ${page}: ${url}`);
                page++;

                const { data } = await axios.get(url, {
                    headers: this.defaultHeaders(),
                    timeout: 60000,
                });

                const $ = cheerio.load(data);
                this.parseResults($, results);
            }

            return { results };
        } catch (error) {
            console.error(`Error scraping ${this.source}:`, error);
            return { results: [] };
        }
    }
    
    private defaultHeaders() {
        return {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
        };
    }
}