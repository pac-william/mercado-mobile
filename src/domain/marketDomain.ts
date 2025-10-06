import { Meta } from "./metaDomain";
import { Product } from "./productDomain";

export class Market {
    constructor(
        public id: string,
        public name: string,
        public address: string,
        public profilePicture: string,
        public products: Product[],
        
    ) { }
}

export class MarketPaginatedResponse {
    constructor(
        public markets: Market[],
        public meta: Meta,
    ) { }
}