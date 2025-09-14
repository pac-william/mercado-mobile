import { Meta } from "./metaDomain";

export class Market {
    constructor(
        public id: string,
        public name: string,
        public address: string,
        public logo: string,
    ) { }
}

export class MarketPaginatedResponse {
    constructor(
        public markets: Market[],
        public meta: Meta,
    ) { }
}