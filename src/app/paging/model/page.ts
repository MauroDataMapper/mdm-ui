/*
Copyright 2020 University of Oxford

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
/**
 * An object used to get page information from the server
 */
export class Page {
    // The number of elements in the page
    size = 0;
    // The total number of elements
    totalElements = 0;
    // The total number of pages
    totalPages = 0;
    // The current page number
    pageNumber = 0;
}
