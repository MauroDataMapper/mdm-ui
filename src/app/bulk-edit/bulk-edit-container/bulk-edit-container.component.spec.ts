import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { BulkEditContainerComponent } from './bulk-edit-container.component';

describe('BulkEditBaseComponent', () => {
  let harness: ComponentHarness<BulkEditContainerComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BulkEditContainerComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
