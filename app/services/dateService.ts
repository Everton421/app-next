

export   function DateService(){

   function formatarDataHora(data: any): string {
        if (!(data instanceof Date)) {
          try {
            data = new Date(data); // Tenta converter para Date
          } catch (error) {
            console.error("Data inválida:", data, error);
            return "Data inválida"; // Ou outra string de erro
          }
      
          if (isNaN(data.getTime())) {
            console.error("Data inválida após tentativa de conversão:", data);
            return "Data inválida"; // Ou outra string de erro
          }
        }
      
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
      
        const hora = String(data.getHours()).padStart(2, '0'); // Garante dois dígitos
        const minuto = String(data.getMinutes()).padStart(2, '0'); // Garante dois dígitos
        const segundos = String(data.getSeconds()).padStart(2, '0'); // Garante dois dígitos
      
        return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundos}`;
      }

 
 function  formatarData(data:any) {
        if (!(data instanceof Date)) {
            try {
              data = new Date(data); // Tenta converter para Date
            } catch (error) {
              console.error("Data inválida:", data, error);
              return "Data inválida"; // Ou outra string de erro
            }
        
            if (isNaN(data.getTime())) {
              console.error("Data inválida após tentativa de conversão:", data);
              return "Data inválida"; // Ou outra string de erro
            }
          }
          const dia = String(data.getDate()).padStart(2, '0');
          const mes = String(data.getMonth() + 1).padStart(2, '0');
          const ano = data.getFullYear();
        
          return `${ano}-${mes}-${dia}`;
    }

    function    obterDataAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }

    function    obterDataAtualPrimeiroDiaDoMes() {
        const dataAtual = new Date();
        const dia = '01';
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }


    function   obterDataHoraAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        const hora = dataAtual.getHours();
        const minuto = dataAtual.getMinutes();
        const segundos = dataAtual.getSeconds();
        return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundos}`;
    }


 function    isValidDateFormat(dateString: string): boolean {
        if (!dateString) return false; // Evita erros com strings vazias/nulas
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
    
        const date = new Date(dateString);
        const timestamp = date.getTime();
    
        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
            return false;
        }
    
        return date.toISOString().slice(0, 10) === dateString;
    }
    
    
    return { formatarData, formatarDataHora, isValidDateFormat,obterDataAtual, obterDataHoraAtual ,obterDataAtualPrimeiroDiaDoMes }

}