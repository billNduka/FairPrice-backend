import { Injectable } from '@nestjs/common';
import { JumiaService } from './jumia.service';
import { KongaService } from './konga.service';

@Injectable()
export class ProductsService {

    constructor(
        private readonly jumiaService: JumiaService,
        private readonly kongaService: KongaService,
    ) {}


    async searchProducts(query:string = "Tecno Camon 40"){

        try{
            const [jumia, konga] = await Promise.all([
                this.jumiaService.searchJumia(query),
                this.kongaService.searchKonga(query),
            ]);
            const jumiaResults = jumia?.results ?? [];
            const kongaResults = konga?.results ?? [];
            const allResults = [...jumiaResults, ...kongaResults];

            const averagePrice = Math.round(allResults.map(r => parseInt(r.price.replace(/\D/g, ""))).reduce((sum, val) => sum + val, 0) / allResults.length);
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
            
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}

