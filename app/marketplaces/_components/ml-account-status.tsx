'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

interface MLAccountStatusProps {
  accountStatus: {
    status: string;
    reputation: number;
    [key: string]: any; // For other fields that might come from the API
  } | null;
  loading: boolean;
  error: string | null;
}

export function MLAccountStatusDisplay({ accountStatus, loading, error }: MLAccountStatusProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 text-slate-500 mx-auto mb-4" />
        <p className="text-slate-500">Carregando status da conta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <AlertCircle className="h-5 w-5 text-red-400 mb-3" />
        <h3 className="text-sm font-medium text-red-800">Erro ao carregar status</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!accountStatus) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-500">Nenhum status de conta disponível</p>
      </div>
    );
  }

  // Determine status color and text based on status value
  const getStatusVariant = (status: string): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string } => {
    const lowerStatus = status//.toLowerCase();
    if (lowerStatus.includes('ativo') || lowerStatus.includes('active')) {
      return { variant: 'default', text: 'Ativo' };
    }
    if (lowerStatus.includes('pendente') || lowerStatus.includes('pending')) {
      return { variant: 'outline', text: 'Pendente' }; // Using outline as warning-like
    }
    if (lowerStatus.includes('restrito') || lowerStatus.includes('restricted') || lowerStatus.includes('suspenso')) {
      return { variant: 'destructive', text: 'Restrito' };
    }
    return { variant: 'secondary', text: status }; // Default to secondary for unknown status
  };

  const { variant, text: statusText } = getStatusVariant(accountStatus.status);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          Status da Conta Mercado Livre
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Última atualização: {new Date().toLocaleString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Status</p>
            <Badge variant={variant} className="text-xs">
              {statusText}
            </Badge>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Reputação</p>
            <p className="text-lg font-semibold">{accountStatus.reputation}</p>
          </div>
          {/* Add more fields as needed from the API response */}
          {accountStatus.points && (
            <div>
              <p className="text-xs font-medium text-slate-500">Pontos</p>
              <p className="text-lg font-semibold">{accountStatus.points}</p>
            </div>
          )}
          {accountStatus.level_id && (
            <div>
              <p className="text-xs font-medium text-slate-500">Nível</p>
              <p className="text-lg font-semibold">{accountStatus.level_id}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}