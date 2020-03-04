import { Injectable } from '@angular/core';
import { ElementTypesService } from "../services/element-types.service";

@Injectable({
  providedIn: 'root'
})
export class MarkdownParserService {

    private  getWindow(): any {
        return window;
    }

    constructor(private elementTypes: ElementTypesService) { }
    
    initialised : boolean = false;

    public htmlRenderer() {
        var marked = this.getWindow().marked;
        var renderer = new marked.Renderer();

        renderer.link = (href: string, title: any, text: string) => {
            if (href && href.indexOf("MC|") === 0) {
                var link = this.createLink(href, title, text);
                return '<a href="' + link + '">' + text + '</a>';
            }
            //return the actual format if it does not star with MC
            return '<a href="' + href + '" target="_blank">' + text + '</a>';
        };

        //just reduce header tags for one level
        renderer.heading = function (text, level, rawtext) {
            var l = level + 1;
            return "<h" + l + ">" + text + "</h" + l + ">";
        };

        renderer.table = function (header, body) {
            var table = '<table class="table table-bordered table-condensed">';
            table += header + body;
            table += '</table>';
            return table;
        };
        return renderer;
    };



    // &#63; to ? helper
    public  htmlEscapeToText(text) {

        return text.replace(/\&\#[0-9]*;|&amp;/g, function (escapeCode) {

            if (escapeCode.match(/amp/)) {

                return '&';

            }

            return String.fromCharCode(escapeCode.match(/[0-9]+/));

        });
    }


    // return a custom renderer for marked.
    public  textRenderer() {
        var marked = this.getWindow().marked;;
        var render = new marked.Renderer();

        // render just the text of a link
        render.code = function (code, language, escaped) {
            return code;
        };

        render.codespan = function (code, language, escaped) {
            return code;
        };

        // render just the text of a link
        render.strong = function (text) {
            return text;
        };

        // render just the text of a link
        render.link = function (href, title, text) {
            return text;
        };

        render.html = function (html) {
            return '';
        },

            // render just the text of a paragraph
            render.paragraph = (text) => {
                return this.htmlEscapeToText(text) + '\r\n';
            };

        // render just the text of a heading element, but indecate level
        render.heading = function (text, level) {
            return text;
        };

        // render nothing for images
        render.image = function (href, title, text) {
            return '';
        };

        render.table = function (header) {
            var table = '<br>[';
            var reg = /<th>(.*?)<\/th>/g;
            var match;
            while (match = reg.exec(header)) {
                table += (match[1] ? match[1] : "...") + ", ";
            }
            table += "...]";
            return table;
        };

        return render;
    };

    public  parse(source, renderType) {
        if (this.getWindow().marked) {

            var renderer = this.htmlRenderer();
            if (renderType === "text") {
                renderer = this.textRenderer();
            }

            var marked = this.getWindow().marked;
            marked.setOptions({
                renderer: renderer,
                gfm: true,
                breaks: true,
                sanitize: true,
                sanitizer: function (code) {
                    return code;
                }
            });
            return marked(source);
        } else {
            return "Markdown parser not found!";
        }
    };

    public  createMarkdownLink(element) {
        var baseTypes = this.elementTypes.getTypes();

        var dataTypeNames = this.elementTypes.getTypesForBaseTypeArray("DataType").map(function (dt) {
            return dt.id;
        });

        var str = "[" + element.label + "](MC|" + baseTypes.find(x => x.id === element.domainType).markdown + "|";

        if (element.domainType === "Folder") {
            str += element.id;
        }

        if (element.domainType === "Classifier") {
            str += element.id;
        }

        if (element.domainType === "DataModel") {
            str += element.id;
        }


        var dataModelId = element.dataModel;
        if (!dataModelId && element.breadcrumbs) {
            dataModelId = element.breadcrumbs[0].id;
        }

        var parentDataClassId = null;
        if (element.parentDataClass) {
            parentDataClassId = element.parentDataClass;
        } else if (element.dataClass) {
            parentDataClassId = element.dataClass;
        } else if (element.breadcrumbs) {
            parentDataClassId = element.breadcrumbs[element.breadcrumbs.length - 1].id;
        }


        if (element.domainType === "DataType" || dataTypeNames.indexOf(element.domainType) !== -1) {
            str += dataModelId + "|" + element.id;
        }


        if (element.domainType === "EnumerationValue") {
            str += dataModelId + "|" + element.dataType;
        }

        if (element.domainType === "DataClass" && !parentDataClassId) {
            str += dataModelId + "|" + element.id;
        }

        if (element.domainType === "DataClass" && parentDataClassId) {

            str += dataModelId + "|" + parentDataClassId + "|" + element.id;
        }

        if (element.domainType === "DataElement") {
            str += dataModelId + "|" + parentDataClassId + "|" + element.id;
        }

        if (element.domainType === "Terminology") {
            str += element.id;
        }

        if (element.domainType === "Term") {
            str += element.terminology + "|" + element.id;
        }


        str += ")";
        return str;
    };

    public createLink(href, title, text) {
        var elements = href.split("|");
        var elementType = elements[1];
        var mcElement = {};

        if (elementType === "FD") {
            mcElement = {
                id: elements[2],
                domainType: "Folder"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "CS") {
            mcElement = {
                id: elements[2],
                domainType: "Classifier"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }


        if (elementType === "DM") {
            mcElement = {
                id: elements[2],
                domainType: "DataModel"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "DC") {
            mcElement = {
                dataModel: elements[2],
                parentDataClass: (elements.length === 5 ? elements[3] : null),
                id: (elements.length === 5 ? elements[4] : elements[3]),
                domainType: "DataClass"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "DT" || elementType === "EV") {
            mcElement = {
                dataModel: elements[2],
                id: elements[3],
                domainType: "DataType"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "DE") {
            mcElement = {
                dataModel: elements[2],
                dataClass: elements[3],
                id: elements[4],
                domainType: "DataElement"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "TM") {
            mcElement = {
                terminology: elements[2],
                id: elements[3],
                domainType: "Term"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

        if (elementType === "TG") {
            mcElement = {
                id: elements[2],
                domainType: "Terminology"
            };
            return this.elementTypes.getLinkUrl(mcElement);
        }

    };
}

