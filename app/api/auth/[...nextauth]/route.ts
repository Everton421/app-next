import { configApi } from '@/app/services/api';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

const api = configApi();

const handler = NextAuth({
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
 

      async authorize(credentials, req) {
        if (credentials?.email && credentials.senha) {
          try {
            // ***IMPORTANTE***: Remova as credenciais fixas (email e senha hardcoded).
            const result = await api.post('/login', { email: credentials.email, senha: credentials.senha });

            if (result.data.ok === true) {
              const user = {
                 email: result.data.email,
                 empresa: result.data.empresa,
                 codigo: result.data.codigo,
                 nome: result.data.nome,
                 // Adicione outros campos relevantes do usuário aqui.
              };


              // Retorne o objeto user *completo*.  Isso é *essencial* para
              // que os callbacks `jwt` e `session` recebam esses dados.
              return user;
            } else {
              // A API retornou que a autenticação falhou.
              return null;
            }
          } catch (error) {
            // Trate erros de rede ou erros da API.  É crucial!
            console.error("Erro durante a autenticação:", error);
            return null; // Indique que a autenticação falhou.
          }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('')
      console.log("JWT Callback - Token:", token, "User:", user);
      console.log('')
       
      if (user) {
        // Adicione os dados do usuário ao token.
        token.empresa = user.empresa;
        token.codigo = user.codigo;
        token.nome = user.nome;
        token.email = user.email; // Adicione o email aqui também
      }
      console.log("JWT Callback - Token (modificado):", token); // ADICIONE ESTE LOG

      return token;  
    },
    async session({ session, token }) {
      console.log('')
      console.log("Session Callback - Session:", session, "Token:", token);
      // Adicione os dados do token à *estrutura existente* da sessão.
      session.user.empresa = token.empresa;
      session.user.codigo = token.codigo;
      session.user.nome = token.nome;
      session.user.email = token.email;

      return session;
    }
  },

   session: {
     strategy: "jwt"  // Use JWT para sessões (recomendado).
   },
   secret: process.env.NEXTAUTH_SECRET, // ***IMPORTANTE***: Defina a variável de ambiente!

});

export { handler as GET, handler as POST };