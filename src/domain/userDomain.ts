import { Meta } from "./metaDomain";

export class User {
    constructor(
        public id: string,
        public name: string,
        public email: string,
        public password: string,
        public auth0Id?: string | null,
        public phone?: string | null,
        public profilePicture?: string | null,
        public birthDate?: Date | null,
        public gender?: string | null,
        public address?: string | null,
        public refreshToken?: string | null,
        public role: string = 'CUSTOMER',
        public marketId?: string | null,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
    ) { }
}

export class UserPaginatedResponse {
    constructor(
        public users: User[],
        public meta: Meta,
    ) { }
}




