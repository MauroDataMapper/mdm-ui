import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { BulkEditSelectComponent } from './bulk-edit-select.component';

describe('BulkEditSelectComponent', () => {
  let harness: ComponentHarness<BulkEditSelectComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BulkEditSelectComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
