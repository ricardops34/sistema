import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Super Admin Catalog (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        login: 'admin@demo.local',
        password: 'password',
        channel: 'platform',
      });

    superAdminToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates, reorders and inactivates modules, groups, routines and routine actions with immediate effect', async () => {
    const uniqueSuffix = Date.now();

    const createModule = await request(app.getHttpServer())
      .post('/super-admin/catalog/modules')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        code: `module-${uniqueSuffix}`,
        name: 'Módulo Admin',
        icon: 'ph ph-gear',
        sortOrder: 90,
      });

    expect(createModule.status).toBe(201);

    const createGroup = await request(app.getHttpServer())
      .post('/super-admin/catalog/groups')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        moduleId: createModule.body.id,
        code: `group-${uniqueSuffix}`,
        name: 'Grupo Admin',
        icon: 'ph ph-folder-open',
        sortOrder: 80,
      });

    expect(createGroup.status).toBe(201);

    const createRoutine = await request(app.getHttpServer())
      .post('/super-admin/catalog/routines')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        moduleId: createModule.body.id,
        menuGroupId: createGroup.body.id,
        code: `routine-${uniqueSuffix}`,
        name: 'Rotina Admin',
        routePath: `/admin/${uniqueSuffix}`,
        icon: 'ph ph-browser',
        sortOrder: 70,
        isVisibleInMenu: true,
      });

    expect(createRoutine.status).toBe(201);

    const reorderRoutine = await request(app.getHttpServer())
      .put(`/super-admin/catalog/routines/${createRoutine.body.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        sortOrder: 10,
      });

    expect(reorderRoutine.status).toBe(200);
    expect(reorderRoutine.body.sortOrder).toBe(10);

    const updateActions = await request(app.getHttpServer())
      .put(`/super-admin/catalog/routines/${createRoutine.body.id}/actions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        actions: [
          {
            code: 'manage',
            name: 'Gerenciar',
            sortOrder: 10,
          },
        ],
      });

    expect(updateActions.status).toBe(200);
    expect(updateActions.body.actions[0].code).toBe('manage');

    const inactivateRoutine = await request(app.getHttpServer())
      .put(`/super-admin/catalog/routines/${createRoutine.body.id}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        isActive: false,
      });

    expect(inactivateRoutine.status).toBe(200);
    expect(inactivateRoutine.body.isActive).toBe(false);
  });
});
