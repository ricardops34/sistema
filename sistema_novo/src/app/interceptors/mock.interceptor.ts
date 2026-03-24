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

  return next(req);
}
