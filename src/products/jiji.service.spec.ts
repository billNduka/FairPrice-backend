import { Test, TestingModule } from '@nestjs/testing';
import { JijiService } from './jiji.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JijiService', () => {
    let service: JijiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JijiService],
        }).compile();

        service = module.get(JijiService);
        jest.clearAllMocks();
    });

    describe('searchJiji()', () => {
        it('should map Price: Descending to price_desc', async () => {
            mockedAxios.get.mockResolvedValue({ data: '<html></html>' });

            await service.search('phone', 'Price: Descending');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('sort=price_desc'),
                expect.anything()
            );
        });

        it('should parse a Jiji product link correctly', async () => {
            mockedAxios.get.mockResolvedValue({
                data: `
                    <html>
                        <body>
                            <a href="https://jiji.ng/product-999" class="product-item">
                                <div class="qa-advert-list-item-title">Jiji Test Product</div>
                                <div class="qa-advert-price">₦ 9,999</div>
                                <img src="https://jiji.ng/images/product-999.jpg" />
                            </a>
                        </body>
                    </html>
                `,
            });

            const result = await service.search('phone', 'Popularity');

            expect(result.results[0]).toEqual({
                source: 'jiji',
                title: 'Jiji Test Product',
                price: '₦ 9,999',
                link: 'https://jiji.ng/product-999',
                image: 'https://jiji.ng/images/product-999.jpg',
            });
        });

        it('should convert relative Jiji links to absolute URLs', async () => {
            mockedAxios.get.mockResolvedValue({
                data: `
                    <html>
                        <body>
                            <a href="/product-123" class="product-item">
                                <div class="qa-advert-list-item-title">Relative Jiji Product</div>
                                <div class="qa-advert-price">₦ 2,500</div>
                                <img src="https://jiji.ng/images/product-123.jpg" />
                            </a>
                        </body>
                    </html>
                `,
            });

            const result = await service.search('phone', 'Popularity');
            expect(result.results[0].link).toBe('https://jiji.ng/product-123');
        });
    });
});
