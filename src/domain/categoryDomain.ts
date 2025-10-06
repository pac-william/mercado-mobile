import { Meta } from "./metaDomain";

export class Category {
    constructor(
        public id: string,
        public name: string,
        public slug?: string,
        public description?: string,
        public subCategories?: Category[],
        public createdAt?: string,
        public updatedAt?: string,
    ) { }
}

export class CategoryPaginatedResponse {
    constructor(
        public category: Category[],
        public meta: Meta,
    ) { }
}

export class SubCategories{
    constructor(
        public name: string,
        public slug: string,
        public description: string,
    ) { }
}