/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { Suspense } from 'react';
import { hot } from 'react-hot-loader/root';
import setupApp from 'src/setup/setupApp';
import './main.less';

// Routes
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { initFeatureFlags } from '../featureFlags';
import { routes } from 'src/activeReports/routes';
import Loading from 'src/components/Loading';
import ErrorBoundary from 'src/components/ErrorBoundary';
import { ThemeProvider } from '@superset-ui/core';
import { theme } from '../preamble';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FlashProvider from '../components/FlashProvider';
import { QueryParamProvider } from 'use-query-params';
import { store } from 'src/activeReports/store';
import { Provider as ReduxProvider } from 'react-redux';
import ToastPresenter from '../messageToasts/containers/ToastPresenter';

setupApp();

const container = document.getElementById('app');
const bootstrap = JSON.parse(container?.getAttribute('data-bootstrap') ?? '{}');
const user = { ...bootstrap.user };
const common = { ...bootstrap.common };
initFeatureFlags(bootstrap.common.feature_flags);

console.log('routes');
console.log(routes);

const RootContextProviders: React.FC = ({ children }) => (
  <ThemeProvider theme={theme}>
    <ReduxProvider store={store}>
      <DndProvider backend={HTML5Backend}>
        <FlashProvider messages={common.flash_messages}>
          <QueryParamProvider
            ReactRouterRoute={Route}
            stringifyOptions={{ encode: false }}
          >
            {children}
          </QueryParamProvider>
        </FlashProvider>
      </DndProvider>
    </ReduxProvider>
  </ThemeProvider>
);

const App = () => (
  <Router>
    <RootContextProviders>
      <Switch>
        {routes.map(({ path, Component, props = {}, Fallback = Loading }) => (
          <Route path={path} key={path}>
            <Suspense fallback={<Fallback />}>
              <ErrorBoundary>
                <Component user={user} {...props} />
              </ErrorBoundary>
            </Suspense>
          </Route>
        ))}
      </Switch>
      <ToastPresenter />
    </RootContextProviders>
  </Router>
);

export default hot(App);
