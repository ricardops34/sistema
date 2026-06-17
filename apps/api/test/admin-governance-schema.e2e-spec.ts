import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('Admin Governance Schema (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('stores assignable, locked and visibility flags required by admin governance', async () => {
    const profileColumns = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tenant_profile'
      ORDER BY column_name
    `);

    const userProfileColumns = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'tenant_user_profile'
      ORDER BY column_name
    `);

    const routineColumns = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'app_routine'
      ORDER BY column_name
    `);

    const moduleColumns = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'app_module'
      ORDER BY column_name
    `);

    const menuGroupColumns = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'app_menu_group'
      ORDER BY column_name
    `);

    expect(profileColumns.map((item) => item.column_name)).toContain('is_assignable_by_tenant');
    expect(userProfileColumns.map((item) => item.column_name)).toEqual(
      expect.arrayContaining(['granted_by_type', 'is_locked_by_platform']),
    );
    expect(routineColumns.map((item) => item.column_name)).toContain('is_visible_in_menu');
    expect(moduleColumns.map((item) => item.column_name)).toContain('icon');
    expect(menuGroupColumns.map((item) => item.column_name)).toContain('sort_order');
  });
});
