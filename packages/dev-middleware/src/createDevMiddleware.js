/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall react_native
 */

import type {NextHandleFunction} from 'connect';
import type {EventReporter} from './types/EventReporter';
import type {Logger} from './types/Logger';

import connect from 'connect';
import openDebuggerMiddleware from './middleware/openDebuggerMiddleware';
import InspectorProxy from './inspector-proxy/InspectorProxy';

type Options = $ReadOnly<{
  host: string,
  port: number,
  projectRoot: string,
  logger?: Logger,
  unstable_eventReporter?: EventReporter,
}>;

type DevMiddlewareAPI = $ReadOnly<{
  middleware: NextHandleFunction,
  websocketEndpoints: {[path: string]: ws$WebSocketServer},
}>;

export default function createDevMiddleware({
  host,
  port,
  projectRoot,
  logger,
  unstable_eventReporter,
}: Options): DevMiddlewareAPI {
  const inspectorProxy = new InspectorProxy(
    projectRoot,
    unstable_eventReporter,
  );

  const middleware = connect()
    .use(
      '/open-debugger',
      openDebuggerMiddleware({
        logger,
        eventReporter: unstable_eventReporter,
      }),
    )
    .use((...args) => inspectorProxy.processRequest(...args));

  return {
    middleware,
    websocketEndpoints: inspectorProxy.createWebSocketListeners(
      `${host}:${port}`,
    ),
  };
}
