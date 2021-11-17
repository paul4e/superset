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
import { Core } from '@grapecity/activereports';

const ARJS_LICENSE = process.env.ARJSSERVER_LICENCE || '';
console.log(`ARJS LICENSE: \n${ARJS_LICENSE}`);

Core.setLicenseKey(
  '43consulting,E821499655835944#B0KFYSThlTWVmNmF5Y4E7cvN6QxJWQ8N4Nrx6Tz3UZmRXdwlWW6cDW6YHdJ9WNGxERvAFe6ZWb6hTNhplZINVS83SNSpnbZJmN7lmTrMUZzUzaIdTVUdHS7kzYzZmbXJGRHVGe5JEcPlHNXdGOvEmaPBje5tSMkljcCBjSBF4SLhzM7dzbsZlb7kDdvElSQJWU9lUWQhHa8ETczcnV6okNXlUbEpHbVdmZwN5ZhVmYPdVZ7M6YxUGVTNFUIV4SpFUdJBFSz8UaUlmbmdFcJh4aTFTSvtCNIlWWzZTa826RlVkatJzSZJ6QSlUYThGe8MXWyA5TiojITJCLiMUQGZjM6AzMiojIIJCL9cTN8QDM7AjM0IicfJye35XX3JSSWFURiojIDJCLiIjVgMlS4J7bwVmUlZXa4NWQiojIOJyebpjIkJHUiwiIyMTO4cDMgETMxETMyAjMiojI4J7QiwiIxEjMxEjMwIjI0ICc8VkIsIyZulGdsV7cu36YzQjI0ISYONkIsUWdyRnOiwmdFJCLiQDN9UzM8UTN6kTO4EjM8IiOiQWSiwSfdtlOicGbmJCLlNHbhZmOiI7ckJye0ICbuFkI1pjIEJCLi4TPRBlahZHWVVTbxJUcPljZkZEN8ombi3GbzFGdxhkRwB5anVWOBFTO8g7LopXMXZkQBhlNQFWZrpVSKNWbWd6VD3WbQp6U4onbw3UMrlEO4FET4YXQ7dUUMZXOi9EaPRjbw1SO',
);
// Core.setLicenseKey(ARJS_LICENSE);
