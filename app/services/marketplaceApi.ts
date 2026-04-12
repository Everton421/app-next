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