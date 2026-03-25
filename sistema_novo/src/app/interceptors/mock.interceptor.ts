import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export function mockInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const { url, method } = req;

  // Estados
  if (url.includes('/api/v1/estados') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, nome: 'Paraná' },
            { id: 2, nome: 'Santa Catarina' },
            { id: 3, nome: 'Rio Grande do Sul' },
            { id: 4, nome: 'São Paulo' },
            { id: 5, nome: 'Rio de Janeiro' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Cidades
  if (url.includes('/api/v1/cidades') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, nome: 'Curitiba', estadoNome: 'Paraná' },
            { id: 2, nome: 'Florianópolis', estadoNome: 'Santa Catarina' },
            { id: 3, nome: 'Porto Alegre', estadoNome: 'Rio Grande do Sul' },
            { id: 4, nome: 'São Paulo', estadoNome: 'São Paulo' },
            { id: 5, nome: 'Rio de Janeiro', estadoNome: 'Rio de Janeiro' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Funções
  if (url.includes('/api/v1/funcoes') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, descricao: 'Consultor' },
            { id: 2, descricao: 'Desenvolvedor' },
            { id: 3, descricao: 'Gerente de Projeto' },
            { id: 4, descricao: 'Analista de Negócios' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Profissionais
  if (url.includes('/api/v1/profissionais') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, nome: 'Ricardo Silva', usuarioSistema: 'ricardo.admin' },
            { id: 2, nome: 'João Souza', usuarioSistema: 'joao.user' },
            { id: 3, nome: 'Maria Oliveira', usuarioSistema: 'maria.consultor' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Empresas
  if (url.includes('/api/v1/empresas') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, nome: 'RCG Consultoria', razao: 'RCG Servicos LTDA', responsalvel: 'Ricardo', cidadeNome: 'Curitiba', endereco: 'Rua das Flores, 100' },
            { id: 2, nome: 'Posto Central', razao: 'Posto Central ME', responsalvel: 'Carlos', cidadeNome: 'São Paulo', endereco: 'Av. Paulista, 500' },
            { id: 3, nome: 'Mercado Bom Preço', razao: 'Bom Preço Alimentos', responsalvel: 'Ana', cidadeNome: 'Rio de Janeiro', endereco: 'Rua Principal, 10' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Contratos
  if (url.includes('/api/v1/contratos') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, empresaNome: 'RCG Consultoria', descricao: 'Conserto de Servidor', dt_inicio: '2025-01-01', dt_fim: '2025-12-31', tipo: 'F' },
            { id: 2, empresaNome: 'Posto Central', descricao: 'Suporte Mensal', dt_inicio: '2025-02-01', dt_fim: '2025-02-28', tipo: 'H' },
            { id: 3, empresaNome: 'Mercado Bom Preço', descricao: 'Instalação de Rede', dt_inicio: '2025-03-10', dt_fim: '2025-04-10', tipo: 'F' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  return next(req);
}
