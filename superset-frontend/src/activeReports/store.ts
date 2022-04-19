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
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import messageToastReducer from '../components/MessageToasts/reducers';
import { initEnhancer } from 'src/reduxUtils';
import logger from 'src/middleware/loggerMiddleware';
import shortid from 'shortid';

// Some reducers don't do anything, and redux is just used to reference the initial "state".
// This may change later, as the client application takes on more responsibilities.
const noopReducer = <STATE = unknown>(initialState: STATE) => (
  state: STATE = initialState,
) => state;

const container = document.getElementById('app');
const bootstrap = JSON.parse(container?.getAttribute('data-bootstrap') ?? '{}');

// exported for tests
export const rootReducer = combineReducers({
  messageToasts: messageToastReducer,
  common: noopReducer(bootstrap.common || {}),
  user: noopReducer(bootstrap.user || {}),
  impressionId: noopReducer(shortid.generate()),
});

export const store = createStore(
  rootReducer,
  {},
  compose(applyMiddleware(thunk, logger), initEnhancer(false)),
);
