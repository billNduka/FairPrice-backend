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
export type steps = "parsed" | "searched" | "normalized"

@Injectable()
export abstract class BaseScraperService {
    protected abstract source: string;
    protected page: number = 1;
    protected abstract maxPages: number;
    protected genericSortOptions:string[] = ["Popularity", "Newest", "Price: Ascending", "Price: Descending", "Rating"];

    protected abstract buildUrl(query: string, sortType: string, page: number): string;
    
    protected abstract mapSortOption(sort: string): string;

    protected abstract parseResults($: cheerio.CheerioAPI, results: ScrapedProduct[]): void;
  
    protected logExecution(currentStep: steps): void{
        switch (currentStep){
            case "searched":
                console.log(`Searched ${this.source} page ${this.page}...`);
                break;
            case "parsed":
                console.log(`Parsed ${this.source} page ${this.page}...`);
                break;
            case "normalized":
                console.log(`Normalized ${this.source} page ${this.page}...`);
                break;
        }
    }

    public normalizePrices(results: ScrapedProduct[]): number[]{
        const prices = results.map(r => parseInt(r.price.replace(/\D/g, "")));
        this.logExecution("normalized")
        return prices;
    }

    async search(query: string, sort: string): Promise<{ results: ScrapedProduct[] }> {
        const results: ScrapedProduct[] = [];
        const sortType = this.mapSortOption(sort);

        try {
            while (this.page <= this.maxPages) {
                const url = this.buildUrl(query, sortType, this.page);

                const { data } = await axios.get(url, {
                    headers: this.defaultHeaders(),
                    timeout: 100000,
                });

                const $ = cheerio.load(data);
                this.logExecution("parsed");
                this.parseResults($, results);
                this.page++;
            }
            this.logExecution("searched");
            return { results };
        } catch (error) {
            console.error(`Error scraping ${this.source}:`, error);
            return { results: [] };
        }
    }
    
    protected defaultHeaders() {
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