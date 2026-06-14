import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ProductsService } from './../src/products/products.service';

const mockProductsService = {
  searchProducts: jest.fn().mockResolvedValue({
    query: 'fan',
    count: 1,
    lowestPrice: 12000,
    highestPrice: 12000,
    averagePrice: 12000,
    filteredResults: [
      {
        source: 'konga',
        title: 'Test product',
        price: '₦ 12,000',
        link: 'https://www.konga.com.ng/product/123',
      },
    ],
  }),
};

describe('Products smoke test (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProductsService)
      .useValue(mockProductsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products/search should return 200 and a valid payload', async () => {
    const response = await request(app.getHttpServer())
      .get('/products/search')
      .query({ query: 'fan', sort: 'Popularity' })
      .expect(200);

    expect(response.body).toEqual({
      query: 'fan',
      count: 1,
      lowestPrice: 12000,
      highestPrice: 12000,
      averagePrice: 12000,
      filteredResults: [
        {
          source: 'konga',
          title: 'Test product',
          price: '₦ 12,000',
          link: 'https://www.konga.com.ng/product/123',
        },
      ],
    });
  });
});
