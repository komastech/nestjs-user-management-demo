import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { createValidationPipe } from '../src/common/pipes/validation.pipe';

// Tests e2e contre un vrai PostgreSQL (variables DB_* de l'environnement).
describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Même configuration HTTP que dans main.ts
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(createValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Base propre avant la suite de tests
    await app.get(DataSource).query('TRUNCATE TABLE users RESTART IDENTITY');
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const ada = {
    email: 'Ada@Example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
  };
  let adaId: number;

  it('POST /api/v1/users crée un utilisateur (email en minuscules)', async () => {
    const res = await http().post('/api/v1/users').send(ada).expect(201);

    expect(res.body).toMatchObject({
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      status: 'ACTIVE',
    });
    adaId = res.body.id;
  });

  it('POST /api/v1/users refuse un email déjà utilisé', async () => {
    const res = await http()
      .post('/api/v1/users')
      .send({ ...ada, email: 'ADA@example.com' })
      .expect(400);

    expect(res.body.message).toBe('Email already exists');
  });

  it('POST /api/v1/users rejette un payload invalide au format du filtre', async () => {
    const res = await http()
      .post('/api/v1/users')
      .send({
        email: 'pas-un-email',
        firstName: 'X',
        lastName: 'Y',
        role: 'admin',
      })
      .expect(400);

    expect(res.body).toMatchObject({
      statusCode: 400,
      path: '/api/v1/users',
      method: 'POST',
    });
    expect(Array.isArray(res.body.message)).toBe(true);
    expect(typeof res.body.timestamp).toBe('string');
  });

  it('GET /api/v1/users retourne un tableau', async () => {
    const res = await http().get('/api/v1/users').expect(200);

    expect(res.body).toHaveLength(1);
  });

  it('GET /api/v2/users retourne { data, meta }', async () => {
    const res = await http()
      .get('/api/v2/users?search=ada&page=1&limit=10')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.meta).toBeDefined();
  });

  it('PATCH puis GET /api/v1/users/:id', async () => {
    await http()
      .patch(`/api/v1/users/${adaId}`)
      .send({ firstName: 'Augusta' })
      .expect(200);

    const res = await http().get(`/api/v1/users/${adaId}`).expect(200);
    expect(res.body.firstName).toBe('Augusta');
  });

  it('DELETE /api/v1/users/:id puis 404', async () => {
    await http().delete(`/api/v1/users/${adaId}`).expect(204);

    const res = await http().get(`/api/v1/users/${adaId}`).expect(404);
    expect(res.body.statusCode).toBe(404);
  });
});
