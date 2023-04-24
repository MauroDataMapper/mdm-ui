/*
Copyright 2020-2023 University of Oxford and NHS England

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
import {
  CatalogueItemDomainType,
  PathableDomainType,
  isDataType
} from '@maurodatamapper/mdm-resources';
import { RedirectToResult, Transition } from '@uirouter/core';
import { MauroItemProviderService } from './mauro/mauro-item-provider.service';
import { lastValueFrom } from 'rxjs';

/**
 * Redirects to another route based on the Mauro catalogue item path provided in the initial route transition.
 *
 * @param transition The router transition.
 * @returns A promise to the route to redirect to.
 *
 * The initial route transition should contain as parameters:
 *
 * - The domain type
 * - The full path to the catalogue item to view
 */
export const redirectUsingPath = async (
  transition: Transition
): Promise<RedirectToResult> => {
  const params = transition.params();
  const domain: PathableDomainType = params.domain;
  const path: string = params.path;
  const finalised: boolean = params.finalised ?? false;

  const notFoundState: RedirectToResult = {
    state: 'appContainer.mainApp.twoSidePanel.catalogue.notFound'
  };

  const mauroItemProvider = transition
    .injector()
    .get<MauroItemProviderService>(MauroItemProviderService);

  const item$ = mauroItemProvider.locate(path, {
    domain,
    finalisedOnly: finalised
  });

  // Must convert the observable into a promise so the UI Router can use the result
  const item = await lastValueFrom(item$);

  if (!item) {
    return notFoundState;
  }

  // Look at all states registered in UI Router and find the one which matches the domain type
  // of the item - this is the view to use to read it
  const states = transition.router.stateRegistry.get();
  const matchingState = states.find((state) => {
    // Data Type is special because it is multiple domain types
    if (isDataType(item.domainType)) {
      return state.data?.domainTypes?.includes(item.domainType);
    }

    return state.data?.domainType === item.domainType;
  });

  if (!matchingState) {
    return notFoundState;
  }

  return {
    state: matchingState.name,
    params: {
      id: item.id,
      // Parent model cases
      ...(item.model && { dataModelId: item.model }),
      // DataClass cases: parent data class is required
      ...(item.domainType === CatalogueItemDomainType.DataClass && {
        dataClassId: item.parentDataClass ?? ''
      }),
      // DataElement cases: data class is required
      ...(item.domainType === CatalogueItemDomainType.DataElement &&
        item.dataClass && { dataClassId: item.dataClass }),
      // DataType cases: ModelDataType returns a `dataModel.id` property
      ...(item.domainType === CatalogueItemDomainType.ModelDataType &&
        item.dataModel?.id && { dataModelId: item.dataModel.id }),
      // Term cases: terminologyId is required
      ...(item.domainType === CatalogueItemDomainType.Term &&
        item.model && { terminologyId: item.model })
    }
  };
};
