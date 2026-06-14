import { Test, TestingModule } from '@nestjs/testing';
import { KongaService } from './konga.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KongaService', () => {
    let service: KongaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [KongaService],
        }).compile();

        service = module.get(KongaService);
        jest.clearAllMocks();
    });

    describe('searchKonga()', () => {
        it('should map Price: Ascending to asc', async () => {
            mockedAxios.get.mockResolvedValue({ data: '<html></html>' });

            await service.searchKonga('fan', 'Price: Ascending');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('sortBy=asc'),
                expect.anything()
            );
        });

        it('should parse a Konga product card correctly', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: `
                    <html>
                        <body>
                            <div class="ListingCard_listingCardMetaContainer__HCXHt">
                                <div class="ListingCard_productTitle_9Kzxv">Konga Test Product</div>
                                <div class="shared_price__gnso_">₦ 12,345</div>
                                <a href="/product/123"></a>
                            </div>
                        </body>
                    </html>
                `,
            });
            mockedAxios.get.mockResolvedValueOnce({ data: '<html></html>' });

            const result = await service.searchKonga('fan', 'Popularity');

            expect(result).toEqual({
                source: 'konga',
                results: [
                    {
                        title: 'Konga Test Product',
                        price: '₦ 12,345',
                        link: 'https://www.konga.com.ng/product/123',
                    },
                ],
            });
        });

        it('should prefix relative Konga links with the full domain', async () => {
            mockedAxios.get.mockResolvedValueOnce({
                data: `
                    <html>
                        <body>
                            <div class="ListingCard_listingCardMetaContainer__HCXHt">
                                <div class="ListingCard_productTitle_9Kzxv">Relative Link Product</div>
                                <div class="shared_price__gnso_">₦ 500</div>
                                <a href="/product/456"></a>
                            </div>
                        </body>
                    </html>
                `,
            });
            mockedAxios.get.mockResolvedValueOnce({ data: '<html></html>' });

            const result = await service.searchKonga('fan', 'Popularity');
            expect(result.results[0].link).toBe('https://www.konga.com.ng/product/456');
        });
    });
});
