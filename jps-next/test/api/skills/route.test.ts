import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '../../../app/api/skills/route';

describe('API Tests - /api/skills', () => {
  describe('GET', () => {
    test('skillsが取得される', async () => {
      await testApiHandler({
        appHandler,
        url: '/api/skills',
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET',
          });
          const json = await response.json();
          console;

          expect(response.status).toBe(200);
          expect(json.items[0].code).toEqual('code_quality');
          expect(json.items[0].sortOrder).toEqual(1);
          expect(json.items[json.items.length - 1].code).toEqual('expression');
          expect(json.items[json.items.length - 1].sortOrder).toEqual(21);
        },
      });
    });
  });
});
