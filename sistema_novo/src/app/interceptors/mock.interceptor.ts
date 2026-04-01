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

  // Agendamentos
  if (url.includes('/api/v1/agendamentos') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            {
              id: 1,
              data_agenda: '2025-03-26',
              tipo: 'P',
              descricao: 'Visita Técnica RCG',
              contrato_nome: 'Conserto de Servidor',
              profissional_nome: 'Ricardo Silva',
              hora_total: '04:00',
              horario_inicial: '2025-03-26T09:00:00',
              horario_final: '2025-03-26T13:00:00',
              cor: '#4CAF50'
            },
            {
              id: 2,
              data_agenda: '2025-03-27',
              tipo: 'R',
              descricao: 'Suporte Remoto Posto',
              contrato_nome: 'Suporte Mensal',
              profissional_nome: 'João Souza',
              hora_total: '02:00',
              horario_inicial: '2025-03-27T14:00:00',
              horario_final: '2025-03-27T16:00:00',
              cor: '#3a87ad'
            },
            {
              id: 3,
              data_agenda: '2025-03-28',
              tipo: 'A',
              descricao: 'Reunião de Alinhamento',
              contrato_nome: 'Consultoria',
              profissional_nome: 'Ricardo Silva',
              hora_total: '01:00',
              horario_inicial: '2025-03-28T10:00:00',
              horario_final: '2025-03-28T11:00:00',
              cor: '#FFC107'
            }
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Feriados
  if (url.includes('/api/v1/feriados') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, data_feriado: '2025-01-01', descricao: 'Ano Novo', tipo: 'N' },
            { id: 2, data_feriado: '2025-04-21', descricao: 'Tiradentes', tipo: 'N' },
            { id: 3, data_feriado: '2025-05-01', descricao: 'Dia do Trabalho', tipo: 'N' },
            { id: 4, data_feriado: '2025-09-07', descricao: 'Independência', tipo: 'N' },
            { id: 5, data_feriado: '2025-10-12', descricao: 'Nossa Aparecida', tipo: 'N' },
            { id: 6, data_feriado: '2025-11-02', descricao: 'Finados', tipo: 'N' },
            { id: 7, data_feriado: '2025-11-15', descricao: 'República', tipo: 'N' },
            { id: 8, data_feriado: '2025-12-25', descricao: 'Natal', tipo: 'N' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Colaboradores
  if (url.includes('/api/v1/colaboradores') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, nome: 'Alberto Santos', email: 'alberto@teste.com', matricula: 'COL001', status: 'A', telefone: '(41) 99999-0001' },
            { id: 2, nome: 'Beatriz Silva', email: 'beatriz@teste.com', matricula: 'COL002', status: 'A', telefone: '(41) 99999-0002' },
            { id: 3, nome: 'Claudio Duarte', email: 'claudio@teste.com', matricula: 'COL003', status: 'I', telefone: '(41) 99999-0003' },
            { id: 4, nome: 'Daniela Souza', email: 'daniela@teste.com', matricula: 'COL004', status: 'A', telefone: '(41) 99999-0004' },
            { id: 5, nome: 'Eduardo Lima', email: 'eduardo@teste.com', matricula: 'COL005', status: 'A', telefone: '(41) 99999-0005' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Trabalhos Realizados (Apontamentos)
  if (url.includes('/api/v1/realizados') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, data_realizado: '2025-03-25', profissional_nome: 'Ricardo Silva', empresa_nome: 'RCG Consultoria', descricao: 'Ajuste de Servidor DNS', horas_total: 4, valor_total: 800, status: 'C' },
            { id: 2, data_realizado: '2025-03-26', profissional_nome: 'João Souza', empresa_nome: 'Posto Central', descricao: 'Treinamento de Equipe', horas_total: 8, valor_total: 1200, status: 'C' },
            { id: 3, data_realizado: '2025-03-26', profissional_nome: 'Ricardo Silva', empresa_nome: 'Mercado Bom Preço', descricao: 'Configuração de Rede', horas_total: 2, valor_total: 300, status: 'P' },
            { id: 4, data_realizado: '2025-03-27', profissional_nome: 'Maria Oliveira', empresa_nome: 'Fazenda Verde', descricao: 'Instalação de Câmeras', horas_total: 6, valor_total: 1500, status: 'C' },
            { id: 5, data_realizado: '2025-03-27', profissional_nome: 'João Souza', empresa_nome: 'RCG Consultoria', descricao: 'Manutenção Mensal', horas_total: 10, valor_total: 2000, status: 'P' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Usuários (Admin)
  if (url.includes('/api/v1/users') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, login: 'admin', nome: 'Administrador do Sistema', email: 'admin@sistema.com', perfil: 'admin', status: 'A' },
            { id: 2, login: 'ricardo', nome: 'Ricardo Silva', email: 'ricardo@sistema.com', perfil: 'admin', status: 'A' },
            { id: 3, login: 'consultor', nome: 'João Consultor', email: 'consultor@sistema.com', perfil: 'user', status: 'A' },
            { id: 4, login: 'gestor', nome: 'Maria Gestora', email: 'gestor@sistema.com', perfil: 'admin', status: 'A' },
            { id: 5, login: 'visitante', nome: 'Visitante Teste', email: 'visitante@sistema.com', perfil: 'guest', status: 'I' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  // Grupos (Admin)
  if (url.includes('/api/v1/groups') && method === 'GET') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          items: [
            { id: 1, nome: 'Administradores', descricao: 'Acesso total ao sistema', status: 'A' },
            { id: 2, nome: 'Consultores', descricao: 'Acesso às telas de serviço e agendamento', status: 'A' },
            { id: 3, nome: 'RH', descricao: 'Acesso ao cadastro de colaboradores', status: 'A' },
            { id: 4, nome: 'Inativos', descricao: 'Grupo sem permissões', status: 'I' },
          ],
          hasNext: false,
        },
      })
    ).pipe(delay(500));
  }

  return next(req);
}
