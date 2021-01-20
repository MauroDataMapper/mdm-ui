/* eslint-disable id-blacklist */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileModalDataModel } from '@mdm/model/profilerModalDataModel';
import { MdmResourcesService } from '@mdm/modules/resources';
import { ElementSelectorComponent } from '@mdm/utility/element-selector.component';
import { MarkdownParserService } from '@mdm/utility/markdown/markdown-parser/markdown-parser.service';

@Component({
  selector: 'mdm-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss']
})
export class EditProfileModalComponent implements OnInit {
  profileData: any;
  elementDialogue: any;
  selectedElement: any;

  saveInProgress = false;

  formOptionsMap = {
    Integer: 'number',
    String: 'text',
    Boolean: 'checkbox',
    boolean: 'checkbox',
    int: 'number',
    date: 'date',
    time: 'time',
    datetime: 'datetime',
    decimal: 'number'
  };

  constructor(
    public dialogRef: MatDialogRef<EditProfileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileModalDataModel,
    private markdownParser: MarkdownParserService,
    protected resourcesSvc: MdmResourcesService,
    private dialog: MatDialog
  ) {

    data.profile.sections.forEach(section => {
      section.fields.forEach(field => {
        if(field.dataType === 'folder')
        {
          field.currentValue = JSON.parse(field.currentValue);
        }
      });
    });

    this.profileData = data.profile;
  }

  ngOnInit(): void {}

  save() {
    // Save Changes

    this.profileData.sections.forEach(section => {
      section.fields.forEach(field => {
        if(field.dataType === 'folder')
        {
          field.currentValue = JSON.stringify(field.currentValue);
        }
      });
    });

    this.dialogRef.close(this.profileData);
  }

  onCancel() {
    this.dialogRef.close();
  }

  showAddElementToMarkdown = (field) => {
   const dg = this.dialog.open(ElementSelectorComponent, {
      data: { validTypesToSelect : ['DataModel'], notAllowedToSelectIds : []},
      panelClass: 'element-selector-modal'
    });

    dg.afterClosed().subscribe((dgData) => {
      this.markdownParser.createMarkdownLink(dgData).then((mkData) => {
         field.currentValue = mkData;
      });
    });
  };
}
