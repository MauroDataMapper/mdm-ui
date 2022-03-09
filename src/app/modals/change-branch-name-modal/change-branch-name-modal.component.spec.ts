import { ComponentHarness, setupTestModuleForComponent } from '@mdm/testing/testing.helpers';
import { ChangeBranchNameModalComponent } from './change-branch-name-modal.component';

describe('ChangeBranchNameModalComponent', () => {
  let harness: ComponentHarness<ChangeBranchNameModalComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ChangeBranchNameModalComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
