/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { schema } from '@osd/config-schema';
import { IRouter, SavedObjectsClientContract } from 'opensearch-dashboards/server';
import { DataSourceAttributes } from '../../../../../src/plugins/data_source/common/data_sources';
import { API } from '../../../common';

export function registerDataSourceConnectionsRoutes(router: IRouter, savedObjectsClient: SavedObjectsClientContract) {
  router.get(
    {
      path: API.DATA_SOURCE.CONNECTIONS,
      validate: {
        params: schema.object({}, { unknowns: 'allow' }),
      },
    },
    async (context, request, response) => {
      const fields = ['id', 'title', 'auth.type'];
      const resp = await savedObjectsClient.find<DataSourceAttributes>({
        type: 'data-source',
        fields,
        perPage: 10000,
      });
      const resp2 = await context.core.savedObjects.client.find<DataSourceAttributes>({
        type: 'data-source',
        fields,
        perPage: 10000,
      });
      const arr = [...resp.saved_objects, ...resp2.saved_objects];

      return response.ok({ body: { savedObjects: arr } });
    }
  );

  router.get(
    {
      path: `${API.DATA_SOURCE.CONNECTIONS}/{dataSourceId}`,
      validate: {
        params: schema.object({
          dataSourceId: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const resp2 = await context.core.savedObjects.client.get<DataSourceAttributes>(
          'data-source',
          request.params.dataSourceId
        );
        if (resp2) {
          return response.ok({ body: { dataSource: resp2 } });
        }
      } catch (e) {
        console.log('error caught:', e);
      }
      const resp = await savedObjectsClient.get<DataSourceAttributes>(
        'data-source',
        request.params.dataSourceId
      );
      return response.ok({ body: { dataSource: resp } });
    }
  );
}
