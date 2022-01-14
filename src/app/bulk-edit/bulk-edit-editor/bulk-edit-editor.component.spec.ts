import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { BulkEditEditorComponent } from './bulk-edit-editor.component';

describe('BulkEditEditorComponent', () => {
  let harness: ComponentHarness<BulkEditEditorComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BulkEditEditorComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
