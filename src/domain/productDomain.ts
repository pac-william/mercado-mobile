import { Meta } from "./metaDomain";
import { Category } from "./categoryDomain";

export class Product {
    constructor(
        public id: string,
        public name: string,
        public price: number,
        public marketId: string,
        public unit?: string,
        public image?: string,
        public categoryId?: string,
        public category?: Category,
    ) { }
}

export class ProductPaginatedResponse {
    constructor(
        public products: Product[],
        public meta: Meta,
    ) { }
}
