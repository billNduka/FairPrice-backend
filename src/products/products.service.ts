import { Injectable } from '@nestjs/common';
import { JumiaService } from './jumia.service';
import { KongaService } from './konga.service';
import { JijiService } from './jiji.service';

@Injectable()
export class ProductsService {

    constructor(
        private readonly jumiaService: JumiaService,
        private readonly kongaService: KongaService,
        private readonly jijiService: JijiService,
    ) {}


    async searchProducts(query:string, sort: string){

        try{
            const [jumia, jiji, konga] = await Promise.all([
                this.jumiaService.search(query, sort),
                this.jijiService.search(query, sort),
                this.kongaService.search(query, sort),
               ]);
                const jumiaResults = jumia?.results ?? [];
                const jijiResults = jiji?.results ?? [];
                const kongaResults = konga?.results ?? [];
                const allResults = [...jumiaResults, ...jijiResults, ...kongaResults];

            // Handle empty results
            if (allResults.length === 0) {
                return {
                    query,
                    count: 0,
                    lowestPrice: null,
                    highestPrice: null,
                    averagePrice: 0,
                    filteredResults: []
                };
            }

            //const prices = allResults.map(r => parseInt(r.price.replace(/\D/g, "")));
            const prices = this.jumiaService.normalizePrices(allResults);
            const averagePrice = Math.round(prices.reduce((sum, val) => sum + val, 0) / prices.length);
            const filteredResults = allResults.filter(r => {
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
            
        }catch(error: any){
            console.error("Error scraping: ", query, error.message);
            return {
                query,
                count: 0,
                lowestPrice: null,
                highestPrice: null,
                averagePrice: 0,
                filteredResults: [],
                error: error.message
            };
        }
    }
}

