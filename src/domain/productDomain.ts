import { Meta } from "./metaDomain";

export class Product {
    constructor(
        public id: string,
        public name: string,
        public price: number,
        public marketId: string,
        public image?: string,
    ) { }
}

export class ProductPaginatedResponse {
    constructor(
        public products: Product[],
        public meta: Meta,
    ) { }
}