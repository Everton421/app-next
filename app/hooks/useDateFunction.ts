
export function UseDateFunction(){

    function obterDataHoraAtual ( ) {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        
        const hora = dataAtual.getHours()
        const min = dataAtual.getMinutes()
        const sec = dataAtual.getSeconds()
        
        return `${ano}-${mes}-${dia} ${hora}:${min}:${sec}` ;
    }
    
    function obterDataAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }
    

    return { obterDataHoraAtual, obterDataAtual}
}