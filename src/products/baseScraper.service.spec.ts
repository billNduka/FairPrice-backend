import { Test, TestingModule } from '@nestjs/testing';
import { JumiaService } from './jumia.service';
import * as cheerio from "cheerio";
import { BaseScraperService } from './baseScraper.service';
import { ScrapedProduct } from './baseScraper.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// base-scraper.service.spec.ts
// Test the shared logic using a minimal concrete implementation

class TestScraper extends BaseScraperService {
    protected source = 'test';
    protected maxPages = 1;

    protected mapSortOption(sort: string): string {
        return sort === 'Cheap' ? 'asc' : 'desc';
    }

    protected buildUrl(query: string, sortType: string, page: number): string {
        return `https://test.com?q=${query}&sort=${sortType}&page=${page}`;
    }

    protected parseResults($: cheerio.CheerioAPI, results: ScrapedProduct[]): void {
        $('div.product').each((_, el) => {
            results.push({
                source: this.source,
                title: $(el).find('.title').text(),
                price: $(el).find('.price').text(),
                link: $(el).find('a').attr('href') || '',
                image: '',
            });
        });
    }
}

describe('BaseScraperService', () => {
    let scraper: TestScraper;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [TestScraper],
        }).compile();

        scraper = module.get(TestScraper);
        jest.clearAllMocks();
    });

    it('should return empty results on network error', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Network Error'));
        const result = await scraper.search('laptop', 'Cheap');
        expect(result).toEqual({ results: [] });
    });

    it('should pass parsed results from parseResults', async () => {
        mockedAxios.get.mockResolvedValue({
            data: `<div class="product">
                     <a href="https://test.com/p.html">
                       <div class="title">Test Product</div>
                       <div class="price">₦1,000</div>
                     </a>
                   </div>`
        });
        const result = await scraper.search('laptop', 'Cheap');
        expect(result.results[0]).toEqual({
            source: 'test',
            title: 'Test Product',
            price: '₦1,000',
            link: 'https://test.com/p.html',
            image: '',
        });
    });
});


