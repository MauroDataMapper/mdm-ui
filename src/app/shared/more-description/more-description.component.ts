import { Component, OnInit, Input } from '@angular/core';
import { UserSettingsHandlerService } from "../../services/utility/user-settings-handler.service";
import { MarkdownParserService } from "../../utility/markdown-parser.service";

@Component({
    selector: 'more-description',
    templateUrl: './more-description.component.html',
    styleUrls: ['./more-description.component.sass']
})
export class MoreDescriptionComponent implements OnInit {

    constructor(userSettingsHandler: UserSettingsHandlerService, private markdownParser: MarkdownParserService) {

       this.showMore = userSettingsHandler.get("expandMoreDescription");
    }

    @Input("description") description: String;
    @Input("length") length: any;

    maxLength: number = 100;
    showMore: boolean = false;
    shortDesc: String;
    fullDesc: String;

    ngOnInit() {
        if (this.length !== undefined) {
            this.maxLength = this.length;
        }

        this.shortDesc = this.createShortDescription();
        this.fullDesc = this.markdownParser.parse(this.description, "html");

    }

    toggle() {
        this.showMore = !this.showMore;
    };

    createShortDescription() {
        var desc = this.markdownParser.parse(this.description, "text");
        if (desc && desc.length > this.maxLength) {
            var subStr = desc.substring(0, this.maxLength);
            var lastIndexOf = subStr.lastIndexOf(" ");
            subStr = subStr.substring(0, lastIndexOf);
            return subStr + "...";
        } else {
            return desc;
        }
    };

}
