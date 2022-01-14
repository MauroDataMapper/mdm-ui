import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { BulkEditEditorGroupComponent } from './bulk-edit-editor-group.component';

describe('BulkEditEditorGroupComponent', () => {
  let harness: ComponentHarness<BulkEditEditorGroupComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BulkEditEditorGroupComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
