'use client';
import { configApi } from './api';

export interface MarketplaceAccount {
    id: number;
    ml_user_id: number;
    integration_name: string;
    platform: 'ML' | 'SHOPEE' | 'MAGAZINE' | string;
}

export interface MLAnuncio {
    id: string;
    title: string;
    price: number;
    quantity: number;
    permalink: string;
    thumbnail: string;
    status?: 'active' | 'paused' | 'closed';
}

export interface MarketplaceAnunciosResponse {
    seller_id: number;
    total_found: number;
    items: MLAnuncio[];
}

export interface MLAccountStatus {
    id: number;
    nickname: string;
    registration_date: string;
    first_name: string;
    last_name: string;
    email: string;
    identification: {
        number: string;
        type: string;
    };
    address?: {
        address: string;
        city: string;
        state: string;
        zip_code: string;
    };
    phone?: {
        area_code: string;
        number: string;
        verified: boolean;
    };
    user_type: string;
    site_id: string;
    seller_experience: string;
    seller_reputation: {
        level_id: string | null;
        power_seller_status: string | null;
        transactions: {
            canceled: number;
            completed: number;
            period: string;
            ratings: {
                negative: number;
                neutral: number;
                positive: number;
            };
            total: number;
        };
        metrics: {
            sales: {
                period: string;
                completed: number;
            };
            claims: {
                period: string;
                rate: number;
                value: number;
            };
            delayed_handling_time: {
                period: string;
                rate: number;
                value: number;
            };
            cancellations: {
                period: string;
                rate: number;
                value: number;
            };
        };
    };
    credit: {
        credit_level_id: string;
        rank: string;
        consumed: number;
    };
    status: {
        site_status: string;
        billing: { allow: boolean; codes: string[] };
        buy: { allow: boolean; codes: string[]; immediate_payment: { reasons: string[]; required: boolean } };
        sell: { allow: boolean; codes: string[]; immediate_payment: { reasons: string[]; required: boolean } };
        list: { allow: boolean; codes: string[]; immediate_payment: { reasons: string[]; required: boolean } };
        shopping_cart: { buy: string; sell: string };
        mercadoenvios: string;
        mercadopago_account_type: string;
        mercadopago_tc_accepted: boolean;
        confirmed_email: boolean;
        immediate_payment: boolean;
        required_action: string;
        user_type: string | null;
    };
}

const api = configApi();

export const marketplaceApi = {
    async getAccounts(codigoVendedor: number, token: string): Promise<MarketplaceAccount[]> {
        const result = await api.get(`/ml/accounts/${codigoVendedor}`, {
            headers: { token }
        });
        return result.data || [];
    },

    async getAnunciosML(token: string, mlUserId: number): Promise<MarketplaceAnunciosResponse> {
        const result = await api.get('/ml/get/anuncios', {
            headers: { 
                token,
                ml_user_id: String(mlUserId)
            }
        });
        return result.data;
    },

    async getAnunciosShopee(token: string, shopId: number): Promise<any> {
        const result = await api.get('/shopee/get/anuncios', {
            headers: { 
                token,
                shop_id: String(shopId)
            }
        });
        return result.data;
    },

    async getAnunciosMagazine(token: string, sellerId: number): Promise<any> {
        const result = await api.get('/magazine/get/anuncios', {
            headers: { 
                token,
                seller_id: String(sellerId)
            }
        });
        return result.data;
    },

    async getMLAccountStatus(token: string, mlUserId: number): Promise<MLAccountStatus> {
        const result = await api.get('/ml/tools/status_vendedor', {
            headers: { 
                token,
                ml_user_id: String(mlUserId)
            }
        });
        return result.data;
    }
};

export interface PlatformConfig {
    label: string;
    color: string;
    textColor: string;
    icon: string;
    logo?: string;
}

export const PLATFORM_CONFIG: Record<string, PlatformConfig> = {
    ML: {
        label: 'Mercado Livre',
        color: 'bg-yellow-400',
        textColor: 'text-slate-900',
        icon: 'Store',
        logo: '/images/ML-logo.png'
    },
    SHOPEE: {
        label: 'Shopee',
        color: 'bg-orange-500',
        textColor: 'text-white',
        icon: 'ShoppingBag',
        logo: '/images/shopee-logo.png'
    },
    MAGAZINE: {
        label: 'Magazine Luiza',
        color: 'bg-[#CF4A4A]',
        textColor: 'text-white',
        icon: 'ShoppingBag',
        logo: '/images/magazine-logo.png'
    }
};

export type Platform = keyof typeof PLATFORM_CONFIG;