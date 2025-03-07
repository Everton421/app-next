import { configApi } from '@/app/services/api';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const api = configApi();

const handler = NextAuth({
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Username", type: "text" },
        senha: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (credentials?.email && credentials.senha) {
          try {
            // ***IMPORTANTE***: Remova as credenciais fixas (email e senha hardcoded).
            const result = await api.post('/login', { email: credentials.email, senha: credentials.senha });

            if (result.data.ok === true) {
              const user = {
                email: result.data.email,
                // ***IMPORTANTE***: Não inclua a senha aqui!  Por segurança.
                // senha: result.data.senha,
                empresa: result.data.empresa,
                codigo: result.data.codigo,
                nome: result.data.nome,
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
    async jwt({ token, user, account, profile }) {
      // `user` é preenchido apenas na primeira vez que o JWT é criado
      // (após o login).  Nas chamadas subsequentes, `user` é undefined.

      if (user) {
        // Adicione as propriedades adicionais do usuário ao token JWT.
        token.empresa = user.empresa;
        token.codigo = user.codigo;
        token.nome = user.nome;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Envia as propriedades do token JWT para a sessão do cliente.
      session.empresa = token.empresa;
      session.codigo = token.codigo;
      session.nome = token.nome;
      session.email = token.email; // Garante que o email esteja na sessão.

      return session;
    }
  },
  session: {
    strategy: "jwt"  // Use JWT para sessões (recomendado).
  },
  secret: process.env.NEXTAUTH_SECRET, // ***IMPORTANTE***: Defina a variável de ambiente!
});

export { handler as GET, handler as POST };