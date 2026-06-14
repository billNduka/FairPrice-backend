import { Test, TestingModule } from '@nestjs/testing';
import { JumiaService } from './jumia.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JumiaService', () => {
    let service: JumiaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JumiaService],
        }).compile();

        service = module.get(JumiaService);
        jest.clearAllMocks();
    });

    describe('searchJumia()', () => {
        it('should map Price: Ascending to lowest-price', async () => {
            mockedAxios.get.mockResolvedValue({ data: '<html></html>' });

            await service.search('fan', 'Price: Ascending');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('sort=lowest-price'),
                expect.anything()
            );
        });

        it('should extract a product correctly', async () => {
            mockedAxios.get.mockResolvedValue({
                data: `
                    <html>
                        <body>
                            <a href="https://www.jumia.com.ng/generic-1pcs-5w-e27-screw-led-bulb-high-brightness-cool-white-energy-saving-lamp-419537604.html">
                                <img data-src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/40/6735914/1.jpg?1088" />
                                <div class="name">1PCS 5W E27 Screw LED Bulb High Brightness Cool White Energy-Saving Lamp</div>
                                <div class="prc">₦ 132</div>
                            </a>
                        </body>
                    </html>
                `,
            });

            const result = await service.search('fan', 'Popularity');

            expect(result.results[0]).toEqual({
                source: 'jumia',
                title: '1PCS 5W E27 Screw LED Bulb High Brightness Cool White Energy-Saving Lamp',
                price: '₦ 132',
                link:
                    'https://www.jumia.com.ng/generic-1pcs-5w-e27-screw-led-bulb-high-brightness-cool-white-energy-saving-lamp-419537604.html',
                image:
                    'https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/40/6735914/1.jpg?1088',
            });
        });

        it('should prefix relative links with the full Jumia domain', async () => {
            mockedAxios.get.mockResolvedValue({
                data: `
                    <html>
                        <body>
                            <a href="/product-123.html">
                                <img src="https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/123/1.jpg" />
                                <div class="name">Relative Link Product</div>
                                <div class="prc">₦ 500</div>
                            </a>
                        </body>
                    </html>
                `,
            });

            const result = await service.search('fan', 'Popularity');
            expect(result.results[0].link).toBe('https://www.jumia.com.ng/product-123.html');
        });
    });
});