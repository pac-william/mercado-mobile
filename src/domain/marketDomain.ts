import { Meta } from "./metaDomain";

export class Market {
  constructor(
    public id: string,
    public name: string,
    public address: string,
    public profilePicture?: string,
    public bannerImage?: string,
    public ownerId?: string,
    public managersIds?: string[],
    public createdAt?: string,
    public updatedAt?: string,
    public latitude?: number | null,
    public longitude?: number | null,
    public distance?: number | null,
  ) {}
}

export class MarketPaginatedResponse {
  constructor(
    public markets: Market[],
    public meta: Meta,
  ) {}
}